<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserInfo;
use App\Entity\OrgaInfo;
use App\Entity\OrgaProc;
use App\Entity\Notification;
use App\Form\RegistrationType;
use App\Form\OrgaInfoType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class RegistrationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    #[Route('/registration/step1', name: 'app_registration_step1')]
    public function step1(Request $request, SessionInterface $session): Response
    {
        $user = new User();
        $userInfo = new UserInfo();
        $user->setUserInfo($userInfo);
        
        $form = $this->createForm(RegistrationType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Vérifie si le SIRET existe déjà
            $existingOrgaSiret = $this->entityManager->getRepository(UserInfo::class)
                ->findOneBy(['orgaSiret' => $userInfo->getOrgaSiret()]);

            // Stocke les données du formulaire en session
            $sessionData = [
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'password' => $user->getPassword(),
                'orgaSiret' => $userInfo->getOrgaSiret(),
                'orgaName' => $userInfo->getOrgaName(),
            ];
            $session->set('registration_data', $sessionData);

            if ($existingOrgaSiret) {
                // Récupère l'utilisateur principal via UserInfo pour ce SIRET
                $principalUserInfo = $this->entityManager->getRepository(UserInfo::class)
                    ->findOneBy([
                        'orgaSiret' => $userInfo->getOrgaSiret(),
                        'isPrincipal' => true
                    ]);

                if ($principalUserInfo) {
                    $principalUser = $principalUserInfo->getUser();
                    
                    // Crée le message d'erreur
                    $errorMessage = sprintf(
                        'Un compte utilisateur existe déjà pour ce SIRET. Contactez %s %s pour être ajouté comme utilisateur. Un abonnement "équipe" est nécessaire.',
                        $principalUser->getFirstName(),
                        $principalUser->getLastName()
                    );

                    // Ajoute le message flash
                    $this->addFlash('error', $errorMessage);
                } else {
                    // Au cas où aucun utilisateur principal n'est trouvé
                    $this->addFlash('error', 'Un compte existe déjà pour ce SIRET mais aucun utilisateur principal n\'est défini. Veuillez contacter le support.');
                }

                // Redirige vers le formulaire
                return $this->redirectToRoute('app_registration_step1');
            } else {
                // Nouveau SIRET : redirection vers l'étape 2
                return $this->redirectToRoute('app_registration_step2');
            }
        }

        return $this->render('registration/step1.html.twig', [
            'registrationForm' => $form->createView(),
        ]);
    }

    #[Route('/registration/step2', name: 'app_registration_step2')]
    public function step2(Request $request, SessionInterface $session): Response
    {
        // Vérifie si l'étape 1 a été complétée
        $registrationData = $session->get('registration_data');
        if (!$registrationData) {
            return $this->redirectToRoute('app_registration_step1');
        }

        $orgaInfo = new OrgaInfo();
        $orgaInfo->setOrgaSiret($registrationData['orgaSiret']);
        
        $form = $this->createForm(OrgaInfoType::class, $orgaInfo);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Crée le nouvel utilisateur avec les données de la session
            $result = $this->createNewUserWithOrga($registrationData, $orgaInfo);
            
            // Nettoie la session
            $session->remove('registration_data');
            
            return $this->redirectToRoute('app_dashboard');
        }

        return $this->render('registration/step2.html.twig', [
            'orgaInfoForm' => $form->createView(),
        ]);
    }

    private function createNewUserWithOrga(array $data, OrgaInfo $orgaInfo): User
    {
        // 1. Persiste l'OrgaInfo
        $this->entityManager->persist($orgaInfo);
        
        // 2. Crée l'utilisateur et son UserInfo
        $user = new User();
        $user->setEmail($data['email']);
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        
        // Hash le mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // 3. Crée et configure UserInfo
        $userInfo = new UserInfo();
        $userInfo->setUser($user);
        $userInfo->setOrgaSiret($data['orgaSiret']);
        $userInfo->setOrgaName($data['orgaName']);
        $userInfo->setOrgaInfo($orgaInfo);
        $userInfo->setIsPrincipal(true);  // Premier utilisateur = utilisateur principal
        
        // 4. Initialise la structure OrgaProc
        $orgaProc = new OrgaProc();
        $orgaProc->setOrgaSiret($data['orgaSiret']);
        $orgaProc->setOrgaInfo($orgaInfo);
        
        // 5. Persiste toutes les entités
        $this->entityManager->persist($user);
        $this->entityManager->persist($userInfo);
        $this->entityManager->persist($orgaProc);
        
        // 6. Crée une notification pour l'initialisation
        $notification = new Notification();
        $notification->setOrgaSiret($data['orgaSiret']);
        $notification->setType('CREATION_ORGANISATION');
        $notification->setMessage('Nouvelle organisation créée par ' . $user->getFirstName() . ' ' . $user->getLastName());
        $notification->setCreatedAt(new \DateTime());
        $notification->setUser($user);
        
        $this->entityManager->persist($notification);
        
        // 7. Sauvegarde tout en base
        $this->entityManager->flush();

        return $user;
    }
}