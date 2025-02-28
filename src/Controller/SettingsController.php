<?php

namespace App\Controller;

use App\Entity\IndicatorSettings;
use App\Entity\OrgaInfo;
use App\Repository\IndicatorSettingsRepository;
use App\Repository\OrgaInfoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Psr\Log\LoggerInterface;

class SettingsController extends AbstractController
{
    private $entityManager;
    private $indicatorSettingsRepository;
    private $orgaInfoRepository;
    private $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        IndicatorSettingsRepository $indicatorSettingsRepository,
        OrgaInfoRepository $orgaInfoRepository,
        LoggerInterface $logger
    ) {
        $this->entityManager = $entityManager;
        $this->indicatorSettingsRepository = $indicatorSettingsRepository;
        $this->orgaInfoRepository = $orgaInfoRepository;
        $this->logger = $logger;
    }

    #[Route('/save-settings', name: 'app_save_settings', methods: ['POST'])]
    public function saveSettings(Request $request): JsonResponse
    {
        // Vérifier si l'utilisateur est connecté
        if (!$this->getUser()) {
            return new JsonResponse(['message' => 'Utilisateur non connecté'], Response::HTTP_UNAUTHORIZED);
        }

        // Récupérer les données JSON
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new JsonResponse(['message' => 'Données JSON invalides'], Response::HTTP_BAD_REQUEST);
        }

        // Log des données reçues
        $this->logger->debug('Données de paramètres reçues: ' . json_encode($data));

        // Récupérer l'organisme par son ID
        $orgaInfoId = $data['orgaInfo']['id'] ?? null;
        if (!$orgaInfoId) {
            return new JsonResponse(['message' => 'ID organisme manquant'], Response::HTTP_BAD_REQUEST);
        }

        $orgaInfo = $this->orgaInfoRepository->find($orgaInfoId);
        if (!$orgaInfo) {
            return new JsonResponse(['message' => 'Organisme non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si des paramètres existent déjà pour cet organisme
        $settings = $this->indicatorSettingsRepository->findOneBy(['orgaInfo' => $orgaInfo]);
        
        // Si aucun paramètre n'existe, en créer un nouveau
        if (!$settings) {
            $settings = new IndicatorSettings();
            $settings->setOrgaInfo($orgaInfo);
        }

        // Mettre à jour les réponses aux questions
        for ($i = 1; $i <= 10; $i++) {
            $questionKey = "question{$i}";
            if (isset($data[$questionKey])) {
                $setter = 'set' . ucfirst($questionKey);
                
                // Vérifier si la méthode setter existe
                if (method_exists($settings, $setter)) {
                    $settings->$setter($data[$questionKey]);
                } else {
                    $this->logger->warning("Méthode {$setter} non trouvée dans l'entité IndicatorSettings");
                }
            }
        }

        // Enregistrer les modifications
        $this->entityManager->persist($settings);
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Paramètres sauvegardés avec succès',
            'settings_id' => $settings->getId()
        ]);
    }

    
     #[Route('/get-settings', name: 'app_get_settings', methods: ['GET'])]
     
    public function getSettings(Request $request): JsonResponse
    {
        // Vérifier si l'utilisateur est connecté
        if (!$this->getUser()) {
            return new JsonResponse(['message' => 'Utilisateur non connecté'], Response::HTTP_UNAUTHORIZED);
        }

        // Récupérer l'ID de l'organisme depuis la requête
        $orgaInfoId = $request->query->get('orgaInfoId');
        if (!$orgaInfoId) {
            return new JsonResponse(['message' => 'ID organisme manquant'], Response::HTTP_BAD_REQUEST);
        }

        // Récupérer l'organisme
        $orgaInfo = $this->orgaInfoRepository->find($orgaInfoId);
        if (!$orgaInfo) {
            return new JsonResponse(['message' => 'Organisme non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Récupérer les paramètres
        $settings = $this->indicatorSettingsRepository->findOneBy(['orgaInfo' => $orgaInfo]);
        
        // Si aucun paramètre n'existe, retourner un objet vide
        if (!$settings) {
            return new JsonResponse([]);
        }

        // Préparer les données à retourner
        $result = [
            'id' => $settings->getId(),
            'orgaInfoId' => $orgaInfo->getId()
        ];

        // Ajouter les réponses aux questions
        for ($i = 1; $i <= 10; $i++) {
            $questionKey = "question{$i}";
            $getter = 'get' . ucfirst($questionKey);
            
            // Vérifier si la méthode getter existe
            if (method_exists($settings, $getter)) {
                $result[$questionKey] = $settings->$getter();
            } else {
                $this->logger->warning("Méthode {$getter} non trouvée dans l'entité IndicatorSettings");
            }
        }

        // Log des données envoyées
        $this->logger->debug('Données de paramètres envoyées: ' . json_encode($result));

        return new JsonResponse($result);
    }
}