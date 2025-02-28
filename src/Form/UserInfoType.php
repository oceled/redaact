<?php

namespace App\Form;

use App\Entity\UserInfo;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Regex;

class UserInfoType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('orgaSiret', TextType::class, [
                'label' => 'SIRET',
                'constraints' => [
                    new NotBlank([
                        'message' => 'Veuillez entrer un numéro SIRET',
                    ]),
                    new Length([
                        'min' => 14,
                        'max' => 14,
                        'exactMessage' => 'Le numéro SIRET doit contenir exactement {{ limit }} caractères',
                    ]),
                    new Regex([
                        'pattern' => '/^[0-9]{14}$/',
                        'message' => 'Le numéro SIRET doit contenir uniquement des chiffres',
                    ]),
                ],
            ])
            ->add('orgaName', TextType::class, [
                'label' => 'Nom de l\'organisation',
                'constraints' => [
                    new NotBlank([
                        'message' => 'Veuillez entrer le nom de l\'organisation',
                    ]),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => UserInfo::class,
        ]);
    }
}