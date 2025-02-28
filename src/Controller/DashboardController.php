<?php
namespace App\Controller;

use App\Repository\NotificationRepository;
use App\Repository\OrgaProcRepository;
use App\Repository\OrgaIndRepository;
use App\Repository\IndDocRepository; // Ajout
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_USER')]
class DashboardController extends AbstractController
{
    public function __construct(
        private NotificationRepository $notificationRepository,
        private OrgaProcRepository $orgaProcRepository,
        private OrgaIndRepository $orgaIndRepository,
        private IndDocRepository $indDocRepository // Ajout
    ) {}

    // Dans DashboardController.php
#[Route('/dashboard', name: 'app_dashboard')]
public function index(): Response
{
    $user = $this->getUser();
    $userInfo = $user->getUserInfo();
    $orgaSiret = $userInfo->getOrgaSiret();

    $notifications = $this->notificationRepository->findBy(
        ['orgaSiret' => $orgaSiret],
        ['createdAt' => 'DESC'],
        10 
    );

    $procedure = $this->orgaProcRepository->findOneBy(['orgaSiret' => $orgaSiret]);
    
    // Initialisation des tableaux
    $indicators = [];
    $indDocs = $this->indDocRepository->findAll();

    if ($procedure) {
        $rawIndicators = $this->orgaIndRepository->findBy(['orgaProc' => $procedure]);
        
        foreach ($rawIndicators as $indicator) {
            $lastRevision = $indicator->getRevisions()->last();
            
            $indicators[] = [
                'indNumb' => $indicator->getIndNumb(),
                'indName' => $indicator->getIndName(),
                'indObject' => $indicator->getIndObject(),
                'indVoc' => $indicator->getIndVoc(),
                'indDetail' => $indicator->getIndDetail(),
                'indFiles' => $indicator->getIndFiles(),
                'indRedac' => $lastRevision ? $lastRevision->getIndRedac() : null,
                'indApprob' => $lastRevision ? $lastRevision->getIndApprob() : null
            ];
        }
    }

    return $this->render('dashboard/index.html.twig', [
        'user' => $user,
        'userInfo' => $userInfo,
        'notifications' => $notifications,
        'procedure' => $procedure,
        'indicators' => $indicators,
        'indDocs' => $indDocs,
    ]);
}
}
