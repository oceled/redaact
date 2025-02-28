<?php

namespace App\Controller;

use App\Repository\OrgaIndRepository;
use App\Repository\OrgaProcRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_USER')]
class GeneratorController extends AbstractController
{
    #[Route('/generate/{indNumb}', name: 'app_generate_document')]
public function generate(
    int $indNumb,
    OrgaIndRepository $orgaIndRepository,
    OrgaProcRepository $orgaProcRepository
): Response {
    // Récupérer le SIRET de l'utilisateur connecté
    $userInfo = $this->getUser()->getUserInfo();
    $orgaSiret = $userInfo->getOrgaSiret();
    
    // Récupérer la procédure
    $procedure = $orgaProcRepository->findOneBy(['orgaSiret' => $orgaSiret]);
    
    if (!$procedure) {
        $this->addFlash('error', 'Procédure non trouvée');
        return $this->redirectToRoute('app_dashboard');
    }
    
    // Récupérer l'indicateur
    $indicator = $orgaIndRepository->findOneBy([
        'orgaProc' => $procedure,
        'indNumb' => $indNumb
    ]);

    if (!$indicator) {
        $this->addFlash('error', 'Indicateur non trouvé');
        return $this->redirectToRoute('app_dashboard');
    }

    // Simplification de la vérification du contenu
    $hasContent = !empty($indicator->getIndName()) || 
                 !empty($indicator->getIndObject()) || 
                 !empty($indicator->getIndVoc()) || 
                 !empty($indicator->getIndDetail()) || 
                 !empty($indicator->getIndFiles());

    if (!$hasContent) {
        $this->addFlash('warning', 'Pas de données à afficher pour cet indicateur');
        return $this->redirectToRoute('app_dashboard');
    }
    
    return $this->render('generator/document.html.twig', [
        'indicator' => $indicator,
        'userInfo' => $userInfo,
        'procedure' => $procedure
    ]);
}
}