<?php

namespace App\Form;

use App\Entity\OrgaInfo;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Range;

class OrgaInfoType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('orgStatus', ChoiceType::class, [
                'label' => 'Statut de l\'organisation',
                'choices' => [
                    'SARL' => 'SARL',
                    'SAS' => 'SAS',
                    'EURL' => 'EURL',
                    'SASU' => 'SASU',
                    'EIRL' => 'EIRL',
                    'Micro-entreprise' => 'Micro-entreprise',
                    'Association' => 'Association',
                    'Coopérative (CAE)' => 'CAE',
                    'Portage salarial' => 'Portage'
                ],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Veuillez sélectionner un statut',
                    ]),
                ],
            ])
            ->add('orgEmp', IntegerType::class, [
                'attr' => [
                    'min' => 0,
                    'max' => 100,
                    'value' => 0,
                    'step' => 1
                ],
                'label' => 'Nombre d\'employés',
                'required' => true
            ])
            ->add('orgCatAct', ChoiceType::class, [
				'label' => 'Catégorie d\'activité',
				'choices' => [
					'AFC' => 'AFC',
					'CFA' => 'CFA',
					'VAE' => 'VAE',
					'CBC' => 'CBC'
				],
				'multiple' => true,
				'expanded' => true,
				'mapped' => true,
				'required' => true,  // On force le champ à être requis
				'constraints' => [
					new NotBlank([
						'message' => 'Veuillez sélectionner au moins une catégorie d\'activité',
					]),
				],
			])
            ->add('orgCert', ChoiceType::class, [
                'label' => 'Certification',
                'choices' => [
                    'RNCP' => 'RNCP',
                    'RS' => 'RS'
                ],
                'multiple' => true,
                'expanded' => true,
                'mapped' => false,
				'required' => false, // Permet au champ d'être null
			])
            ->add('orgSubDo', ChoiceType::class, [
				'label' => 'Prestation en sous-traitance ',
				'choices' => [
					'Oui' => true,
					'Non' => false
				],
				'expanded' => true,  // Ajoute cette ligne pour avoir des radio buttons
				'multiple' => false, // S'assure qu'un seul choix est possible
				'required' => true,  // Force la sélection d'une option
			])
			->add('orgSubUse', ChoiceType::class, [
				'label' => 'Recours à la sous-traitance',
				'choices' => [
					'Oui' => true,
					'Non' => false
				],
				'expanded' => true,  // Ajoute cette ligne pour avoir des radio buttons
				'multiple' => false, // S'assure qu'un seul choix est possible
				'required' => true,  // Force la sélection d'une option
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => OrgaInfo::class,
        ]);
    }
}