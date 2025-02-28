<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Doctrine\ORM\EntityManagerInterface;

#[IsGranted('ROLE_USER')]
class LogoController extends AbstractController
{
    #[Route('/api/upload-logo', name: 'app_upload_logo', methods: ['POST'])]
    public function uploadLogo(Request $request, EntityManagerInterface $em): JsonResponse
    {
        try {
            $file = $request->files->get('logo');
            if (!$file) {
                return $this->json(['success' => false, 'error' => 'Aucun fichier envoyé'], 400);
            }

            $uploadDir = $this->getParameter('logos_directory');
            if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true)) {
                return $this->json(['success' => false, 'error' => 'Erreur création dossier'], 500);
            }

            // Génération du nom de fichier
            $extension = $file->getClientOriginalExtension();
            $newFilename = uniqid() . '.' . $extension;

            // Upload du fichier
            $file->move($uploadDir, $newFilename);

            // Mise à jour de l'entité
            $user = $this->getUser();
            $orgaInfo = $user->getUserInfo()->getOrgaInfo();
            $orgaInfo->setLogo($newFilename);
            
            // Forcer la persistence et le flush
            $em->persist($orgaInfo);
            $em->flush();

            return $this->json([
                'success' => true,
                'logoUrl' => '/uploads/logos/' . $newFilename
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false, 
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}