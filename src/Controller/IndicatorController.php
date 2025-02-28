<?php

namespace App\Controller;

use App\Entity\OrgaInd;
use App\Entity\IndCrea;
use App\Entity\IndUpdt;
use App\Repository\OrgaProcRepository;
use App\Repository\OrgaIndRepository;
use App\Repository\IndCreaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Psr\Log\LoggerInterface;

class IndicatorController extends AbstractController
{
    #[Route('/indicator/save', name: 'app_indicator_save', methods: ['POST'])]
    public function save(
        Request $request,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
        OrgaIndRepository $orgaIndRepository,
        IndCreaRepository $IndCreaRepository,
        OrgaProcRepository $orgaProcRepository
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);
            
            $logger->info('Données reçues pour sauvegarde', [
                'indNumb' => $data['indNumb'] ?? 'Non défini',
                'userEmail' => $this->getUser()->getEmail()
            ]);
            
            if (!isset($data['indNumb'])) {
                throw new \Exception('Numéro d\'indicateur manquant');
            }

            $indNumb = (int)$data['indNumb'];
            
            // Récupérer l'OrgaProc
            $user = $this->getUser();
            if (!$user) {
                throw new \Exception('Utilisateur non connecté');
            }

            $orgaProc = $orgaProcRepository->findOneBy([
                'orgaSiret' => $user->getUserInfo()->getOrgaSiret()
            ]);

            if (!$orgaProc) {
                throw new \Exception('Procédure non trouvée');
            }

            // Rechercher l'indicateur existant
            $indicator = $orgaIndRepository->findOneBy([
                'indNumb' => $indNumb,
                'orgaProc' => $orgaProc
            ]);

            // Créer si n'existe pas
            if (!$indicator) {
                $indicator = new OrgaInd();
                $indicator->setIndNumb($indNumb);
                $indicator->setOrgaProc($orgaProc);
            }

            // Vérifier si des données sont présentes dans le formulaire
            $hasNewData = !empty($data['indName']) || !empty($data['indObject']) || 
                       !empty($data['indVoc']) || !empty($data['indDetail']) || 
                       !empty($data['indFiles']);

            // Vérifier si des données existent en base
            $hasExistingData = !empty($indicator->getIndName()) || !empty($indicator->getIndObject()) ||
                            !empty($indicator->getIndVoc()) || !empty($indicator->getIndDetail()) ||
                            !empty($indicator->getIndFiles());

            // Si aucune donnée n'est présente, on sort immédiatement
            if (!$hasNewData && !$hasExistingData) {
                $logger->info('Aucune donnée à enregistrer');
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Pas d\'information à enregistrer'
                ]);
            }

            // Mise à jour des données de l'indicateur
            $indicator->setIndName($data['indName'] ?? '');
            $indicator->setIndObject($data['indObject'] ?? '');
            $indicator->setIndVoc($data['indVoc'] ?? '');
            $indicator->setIndDetail($data['indDetail'] ?? '');
            $indicator->setIndFiles($data['indFiles'] ?? '');

            // Log des données
            $logger->info('État des données', [
                'hasNewData' => $hasNewData,
                'hasExistingData' => $hasExistingData
            ]);

            // On ne traite la révision que s'il y a des données
            if ($hasNewData && isset($data['revision'])) {
                $hasExistingRevisions = !$indicator->getRevisions()->isEmpty();
                
                if (!$hasExistingRevisions) {
                    // Première création - vérifier qu'il n'y a pas déjà une révision
                    $existingRevision = $IndCreaRepository->findOneBy([
                        'indicator' => $indicator
                    ]);

                    if (!$existingRevision) {
                        // Vérifier la présence du rédacteur
                        if (!isset($data['revision']['indRedac']) || empty($data['revision']['indRedac'])) {
                            throw new \Exception('Le rédacteur est obligatoire car des données sont présentes');
                        }
                        // Aucune révision n'existe, on peut créer
                        $revision = new IndCrea();
                        $revision->setIndicator($indicator);
                        $revision->setIndRedac($data['revision']['indRedac']);
                        $revision->setIndApprob($data['revision']['indApprob'] ?? null);
                        $revision->setDCreate(new \DateTime());
                        $revision->setNVers(1);
                        $entityManager->persist($revision);
                        
                        $logger->info('Création première révision', [
                            'indRedac' => $data['revision']['indRedac'] ?? null,
                            'indApprob' => $data['revision']['indApprob'] ?? null
                        ]);
                    }
                } 
                elseif (isset($data['revision']['type'])) {
                    // Indicateur existant
                    $latestRevision = $indicator->getLatestRevision();
                    
                    $logger->info('Type de révision reçu', [
                        'type' => $data['revision']['type'],
                        'hasLatestRevision' => ($latestRevision !== null)
                    ]);
                    
                    if ($data['revision']['type'] === 'correction') {
                        // Simple correction - mise à jour de la révision existante
                        $latestRevision->setIndRedac($data['revision']['indRedac'] ?? null);
                        $latestRevision->setIndApprob($data['revision']['indApprob'] ?? null);
                        $entityManager->persist($latestRevision);
                        
                        $logger->info('Correction de la révision existante');
                    }
                    elseif ($data['revision']['type'] === 'new') {
                        $logger->info('Début création nouvelle version', [
                            'data' => $data,
                            'latestRevision' => $latestRevision ? $latestRevision->getId() : null
                        ]);

                        if (!$latestRevision) {
                            throw new \Exception('Impossible de créer une nouvelle version : pas de révision trouvée');
                        }

                        try {
                            // Trouver la dernière version pour cette révision spécifique
                            $lastVersion = $entityManager->getRepository(IndUpdt::class)
                                ->createQueryBuilder('u')
                                ->select('MAX(u.n_vers)')
                                ->where('u.revision = :revision')
                                ->setParameter('revision', $latestRevision)
                                ->getQuery()
                                ->getSingleScalarResult();

                            // Si aucune version n'existe dans ind_updt, commencer à 2
                            // Sinon incrémenter la dernière version
                            $newVersion = $lastVersion ? $lastVersion + 1 : 2;

                            $logger->info('Version calculée', [
                                'indNumb' => $indicator->getIndNumb(),
                                'revisionId' => $latestRevision->getId(),
                                'lastVersion' => $lastVersion,
                                'newVersion' => $newVersion
                            ]);

                            // Vérifier la présence du rédacteur
                            if (!isset($data['revision']['indRedac']) || empty($data['revision']['indRedac'])) {
                                throw new \Exception('Le rédacteur est obligatoire car des données sont présentes');
                            }

                            // Créer la nouvelle mise à jour
                            $update = new IndUpdt();
                            $update->setRevision($latestRevision);
                            $update->setDUpdt(new \DateTime());
                            $update->setNVers($newVersion);
                            $update->setMotif($data['revision']['reason']);
                            $update->setIndRedac($data['revision']['indRedac']);
                            $update->setIndApprob($data['revision']['indApprob'] ?? null);

                            // Persister la nouvelle version
                            $entityManager->persist($update);
                            $entityManager->flush();

                            $logger->info('Mise à jour persistée avec succès');

                        } catch (\Exception $e) {
                            $logger->error('Erreur lors de la création de la version', [
                                'error' => $e->getMessage(),
                                'trace' => $e->getTraceAsString()
                            ]);
                            throw $e;
                        }
                    }
                }
            }

            // Persister et flush final
            $entityManager->persist($indicator);
            $entityManager->flush();

            return new JsonResponse([
                'success' => true,
                'message' => 'Informations enregistrées avec succès',
                'indicator' => [
                    'id' => $indicator->getIndNumb(),
                    'indNumb' => $indicator->getIndNumb()
                ]
            ]);
            
        } catch (\Exception $e) {
            // Log détaillé de l'erreur
            $logger->error('Erreur lors de la sauvegarde', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}