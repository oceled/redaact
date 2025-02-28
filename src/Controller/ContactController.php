<?php

namespace App\Controller;

use App\Form\ContactType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class ContactController extends AbstractController
{
    #[Route('/contact', name: 'app_contact')]
    public function index(Request $request, MailerInterface $mailer): Response
    {
        // Supprimez cette ligne de débogage
        // dd($_ENV['MAILER_DSN']);
        
        $form = $this->createForm(ContactType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
    $formData = $form->getData();
    
    $email = (new Email())
        ->from('olivier.ledanois.formation@gmail.com')
        ->replyTo($formData['email'])
        ->to('olivier.ledanois.formation@gmail.com')
        ->subject('Nouveau message de contact - REDA\'ACT')
        ->html($this->renderView('emails/contact.html.twig', [
            'name' => $formData['name'],
            'email' => $formData['email'],
            'subject' => $formData['subject'],
            'message' => $formData['message']
        ]));
    
    try {
        $mailer->send($email);
        $this->addFlash('success', 'Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.');
    } catch (\Exception $e) {
        $this->addFlash('error', 'Une erreur est survenue lors de l\'envoi du message: ' . $e->getMessage());
    }
    
    return $this->redirectToRoute('app_contact');
}

        return $this->render('contact/index.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}