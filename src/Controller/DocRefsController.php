<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\OrgaInd; 
use App\Entity\OrgaInfo;

class DocRefsController extends AbstractController
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/update-procedure-refs', name: 'app_update_procedure_refs', methods: ['POST'])]
    public function updateProcedureRefs(Request $request): JsonResponse
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(['success' => false, 'error' => 'Invalid request'], 400);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['fieldType']) || !isset($data['newValue']) || !isset($data['indNumb'])) {
            return new JsonResponse(['success' => false, 'error' => 'Données invalides'], 400);
        }

        try {
            $indicator = $this->entityManager->getRepository(OrgaInd::class)
                ->findOneBy(['indNumb' => $data['indNumb']]);

            if (!$indicator) {
                return new JsonResponse(['success' => false, 'error' => 'Indicateur non trouvé'], 404);
            }

            $orgaInfo = $indicator->getOrgaProc()->getOrgaInfo();

            switch ($data['fieldType']) {
                case 'procTitle':
                    $orgaInfo->setProcTitle($data['newValue']);
                    break;
                case 'procRef':
                    $orgaInfo->setProcRef($data['newValue']);
                    break;
                default:
                    return new JsonResponse(['success' => false, 'error' => 'Champ invalide'], 400);
            }

            $this->entityManager->persist($orgaInfo);
            $this->entityManager->flush();

            return new JsonResponse([
                'success' => true, 
                'message' => 'Mise à jour réussie'
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false, 
                'error' => 'Une erreur est survenue lors de la mise à jour: ' . $e->getMessage()
            ], 500);
        }
    }
}