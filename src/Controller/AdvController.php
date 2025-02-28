<?php

namespace App\Controller;

use App\Entity\IndDoc;
use App\Repository\IndDocRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

#[IsGranted('ROLE_USER')]
class AdvController extends AbstractController
{
    public function __construct(
        private IndDocRepository $indDocRepository
    ) {}

    #[Route('/adv', name: 'app_adv')]
    public function index(): Response
    {
        // Récupère les documents d'aide
        $indDocs = $this->indDocRepository->findBy(
            [], 
            ['indd_numb' => 'ASC']
        );

        return $this->render('adv/index.html.twig', [
            'indDocs' => $indDocs,
        ]);
    }

    #[Route('/adv/save', name: 'app_adv_save', methods: ['POST'])]
    public function saveIndicator(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                throw new \Exception('Données invalides');
            }
            
            // Cherchons d'abord par indd_numb
            $document = $this->indDocRepository->findOneBy(['indd_numb' => (int)$data['indd_numb']]);
            
            // Si on ne trouve pas le document, on en crée un nouveau
            if (!$document) {
                $document = new IndDoc();
            }
            
            $document->setInddNumb((int)$data['indd_numb']);
            $document->setInddDef($data['indd_def']);
            $document->setInddAdv($data['indd_adv']);
            
            $entityManager->persist($document);
            $entityManager->flush();
            
            return $this->json([
                'success' => true,
                'message' => 'Document enregistré avec succès'
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }
}