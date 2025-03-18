<?php
// ContactController.php

namespace App\Controller;

use App\Form\ContactType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Psr\Log\LoggerInterface;

class ContactController extends AbstractController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    #[Route('/contact', name: 'app_contact')]
    public function index(Request $request, MailerInterface $mailer): Response
    {
        $form = $this->createForm(ContactType::class);
        $form->handleRequest($request);

        $this->logger->info('Contact form page loaded');

        if ($form->isSubmitted()) {
            if ($form->isValid()) {
                $this->logger->info('Form is valid and submitted');
                $formData = $form->getData();
                
                // Adresse email stockée dans une variable pour éviter la duplication
                $adminEmail = 'olivier.ledanois.formation@gmail.com';
                
                try {
                    // Since your form fields are defined in ContactType, they're directly
                    // accessible as array keys in the formData array
                    $userName = $formData['name'];
                    $userEmail = $formData['email'];
                    $userSubject = $formData['subject'];
                    $userMessage = $formData['message'];
                    
                    $this->logger->info('Form data collected: ' . json_encode([
                        'name' => $userName,
                        'email' => $userEmail,
                        'subject' => $userSubject
                    ]));
                    
                    // First check where your template is located
                    // Try both possible paths
                    $templatePath = null;
                    if ($this->container->get('twig')->getLoader()->exists('emails/contact.html.twig')) {
                        $templatePath = 'emails/contact.html.twig';
                        $this->logger->info('Using template path: emails/contact.html.twig');
                    } elseif ($this->container->get('twig')->getLoader()->exists('contact.html.twig')) {
                        $templatePath = 'contact.html.twig';
                        $this->logger->info('Using template path: contact.html.twig');
                    } else {
                        $this->logger->error('Email template not found in either location');
                        throw new \Exception('Email template not found');
                    }
                    
                    // Create the email with form data
                    $email = (new Email())
                        ->from(new Address($adminEmail, 'RED\'ACT Contact'))
                        ->to($adminEmail)
                        ->replyTo(new Address($userEmail, $userName))
                        ->subject('Contact: ' . $userSubject)
                        ->html($this->renderView($templatePath, [
                            'name' => $userName,
                            'email' => $userEmail,
                            'subject' => $userSubject,
                            'message' => $userMessage
                        ]));
                    
                    $this->logger->info('About to send email');
                    $mailer->send($email);
                    $this->logger->info('Email sent successfully');
                    
                    $this->addFlash('success', 'Votre message a été envoyé avec succès');
                    
                } catch (TransportExceptionInterface $e) {
                    // Log detailed error for the developer
                    $this->logger->error('Erreur d\'envoi d\'email (Transport): ' . $e->getMessage());
                    $this->logger->error('Exception trace: ' . $e->getTraceAsString());
                    
                    // Message plus générique pour l'utilisateur
                    $this->addFlash('error', 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer ultérieurement ou nous contacter directement à ' . $adminEmail);
                } catch (\Exception $e) {
                    // Log detailed error for the developer
                    $this->logger->error('Erreur générale: ' . $e->getMessage());
                    $this->logger->error('Exception trace: ' . $e->getTraceAsString());
                    
                    // Message plus générique pour l'utilisateur
                    $this->addFlash('error', 'Une erreur est survenue. Veuillez réessayer ultérieurement.');
                }
            } else {
                $this->logger->error('Form submitted but not valid');
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                    // Ajouter chaque erreur comme flash message
                    $this->addFlash('error', $error->getMessage());
                }
                $this->logger->error('Form errors: ' . json_encode($errors));
                
                // Ajouter un message d'erreur général
                $this->addFlash('error', 'Le formulaire contient des erreurs. Veuillez vérifier vos informations.');
                
                // Afficher les erreurs de chaque champ individuellement
                foreach ($form as $fieldName => $formField) {
                    foreach ($formField->getErrors() as $error) {
                        $this->addFlash('error', $fieldName . ': ' . $error->getMessage());
                    }
                }
            }
            
            return $this->redirectToRoute('app_contact');
        }

        return $this->render('contact/index.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}