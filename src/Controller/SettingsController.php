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
use Symfony\Component\Validator\Validator\ValidatorInterface;

class SettingsController extends AbstractController
{
    private $entityManager;
    private $indicatorSettingsRepository;
    private $orgaInfoRepository;
    private $logger;
    private $validator;

    public function __construct(
        EntityManagerInterface $entityManager,
        IndicatorSettingsRepository $indicatorSettingsRepository,
        OrgaInfoRepository $orgaInfoRepository,
        LoggerInterface $logger,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->indicatorSettingsRepository = $indicatorSettingsRepository;
        $this->orgaInfoRepository = $orgaInfoRepository;
        $this->logger = $logger;
        $this->validator = $validator;
    }

    #[Route('/save-settings', name: 'app_save_settings', methods: ['POST'])]
    public function saveSettings(Request $request): JsonResponse
    {
        $this->logger->info('Début de la sauvegarde des paramètres');

        try {
            // Vérifier si l'utilisateur est connecté
            $user = $this->getUser();
            if (!$user) {
                $this->logger->warning('Tentative de sauvegarde sans utilisateur connecté');
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'Utilisateur non connecté'
                ], Response::HTTP_UNAUTHORIZED);
            }

            // Récupérer les données JSON
            $data = json_decode($request->getContent(), true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->logger->error('Erreur de parsing JSON', [
                    'json_error' => json_last_error_msg(),
                    'raw_content' => $request->getContent()
                ]);
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'Données JSON invalides'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Log détaillé des données reçues
            $this->logger->info('Données reçues pour sauvegarde', [
				'data' => $data,
				'user' => $user->getUserIdentifier() // Utilisez cette méthode
			]);

            // Validation des données de base
            $orgaInfoId = $data['orgaInfo']['id'] ?? null;
            if (!$orgaInfoId) {
                $this->logger->warning('ID organisme manquant', ['data' => $data]);
                return new JsonResponse([
                    'status' => 'error', 
                    'message' => 'ID organisme manquant'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Récupérer l'organisme par son ID
            $orgaInfo = $this->orgaInfoRepository->find($orgaInfoId);
            if (!$orgaInfo) {
                $this->logger->warning('Organisme non trouvé', ['orgaInfoId' => $orgaInfoId]);
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'Organisme non trouvé'
                ], Response::HTTP_NOT_FOUND);
            }

            // Récupérer ou créer les paramètres d'indicateur
            $settings = $this->indicatorSettingsRepository->findOneBy(['orgaInfo' => $orgaInfo]);
            if (!$settings) {
                $settings = new IndicatorSettings();
                $settings->setOrgaInfo($orgaInfo);
            }

            // Utiliser la nouvelle méthode fromArray
            $settings->fromArray($data);

            // Validation de l'entité
            $errors = $this->validator->validate($settings);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                
                $this->logger->warning('Erreurs de validation', ['errors' => $errorMessages]);
                
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'Validation échouée',
                    'errors' => $errorMessages
                ], Response::HTTP_BAD_REQUEST);
            }

            // Persister et flush
            $this->entityManager->persist($settings);
            $this->entityManager->flush();

            $this->logger->info('Paramètres sauvegardés avec succès', [
                'settingsId' => $settings->getId(),
                'orgaInfoId' => $orgaInfoId,
                'questions' => $settings->toArray()
            ]);

            return new JsonResponse([
                'status' => 'success',
                'message' => 'Paramètres sauvegardés avec succès',
                'settings' => $settings->toArray()
            ]);

        } catch (\Exception $e) {
            // Log de l'exception complète
            $this->logger->critical('Erreur lors de la sauvegarde des paramètres', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return new JsonResponse([
                'status' => 'error',
                'message' => 'Erreur serveur lors de la sauvegarde',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/get-settings', name: 'app_get_settings', methods: ['GET'])]
    public function getSettings(Request $request): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'Utilisateur non connecté'
                ], Response::HTTP_UNAUTHORIZED);
            }

            $orgaInfoId = $request->query->get('orgaInfoId');
            if (!$orgaInfoId) {
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'ID organisme manquant'
                ], Response::HTTP_BAD_REQUEST);
            }

            $orgaInfo = $this->orgaInfoRepository->find($orgaInfoId);
            if (!$orgaInfo) {
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'Organisme non trouvé'
                ], Response::HTTP_NOT_FOUND);
            }

            $settings = $this->indicatorSettingsRepository->findOneBy(['orgaInfo' => $orgaInfo]);
            
            if (!$settings) {
                return new JsonResponse([
                    'status' => 'success',
                    'message' => 'Aucun paramètre trouvé',
                    'settings' => []
                ]);
            }

            $this->logger->info('Paramètres récupérés', [
                'orgaInfoId' => $orgaInfoId,
                'settingsId' => $settings->getId()
            ]);

            return new JsonResponse([
                'status' => 'success',
                'settings' => $settings->toArray()
            ]);

        } catch (\Exception $e) {
            $this->logger->critical('Erreur lors de la récupération des paramètres', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return new JsonResponse([
                'status' => 'error',
                'message' => 'Erreur serveur lors de la récupération',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}