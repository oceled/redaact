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
                    'Auto-entrepreneur' => 'Auto-entrepreneur',
					'Entreprise Individuelle' => 'Entreprise Individuelle',
					'SARL' => 'SARL',
                    'SAS' => 'SAS',
					'SA' => 'SA',
                    'EURL' => 'EURL',
                    'SASU' => 'SASU',
                    'EIRL' => 'EIRL',
                    'SNC (Société en Nom Collectif)' => 'SNC (Société en Nom Collectif)',
                    'Association' => 'Association',
                    'Coopérative (CAE)' => 'CAE',
                    'Portage salarial' => 'Portage Portage salarial'
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
                'label' => 'Vos formations conduisent-elles à une certification ?, si oui, cochez la/les catégorie\(s) ',
                'choices' => [
                    'RNCP' => 'RNCP',
                    'RS' => 'RS'
                ],
                'multiple' => true,
                'expanded' => true,
                'mapped' => false,
				'required' => false, // Permet au champ d'être null
			])
            ->add('orgSubUse', ChoiceType::class, [
				'label' => 'Avez-vous recours à la sous-traitance ?',
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