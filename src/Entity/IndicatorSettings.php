<?php

namespace App\Entity;

use App\Repository\IndicatorSettingsRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: IndicatorSettingsRepository::class)]
class IndicatorSettings
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'indicatorSettings')]
    #[ORM\JoinColumn(nullable: false)]
    private ?OrgaInfo $orgaInfo = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $question1 = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $question2 = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $question3 = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $question4 = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $question5 = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $question6 = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $question7 = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $question8 = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $question9 = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $question10 = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getOrgaInfo(): ?OrgaInfo
    {
        return $this->orgaInfo;
    }

    public function setOrgaInfo(?OrgaInfo $orgaInfo): static
    {
        $this->orgaInfo = $orgaInfo;
        return $this;
    }

    public function getQuestion1(): ?bool
    {
        return $this->question1;
    }

    public function setQuestion1(?bool $question1): static
    {
        $this->question1 = $question1;
        return $this;
    }

    public function getQuestion2(): ?bool
    {
        return $this->question2;
    }

    public function setQuestion2(?bool $question2): static
    {
        $this->question2 = $question2;
        return $this;
    }

    public function getQuestion3(): ?bool
    {
        return $this->question3;
    }

    public function setQuestion3(?bool $question3): static
    {
        $this->question3 = $question3;
        return $this;
    }

    public function getQuestion4(): ?bool
    {
        return $this->question4;
    }

    public function setQuestion4(?bool $question4): static
    {
        $this->question4 = $question4;
        return $this;
    }

    public function getQuestion5(): ?bool
    {
        return $this->question5;
    }

    public function setQuestion5(?bool $question5): static
    {
        $this->question5 = $question5;
        return $this;
    }

    public function getQuestion6(): ?bool
    {
        return $this->question6;
    }

    public function setQuestion6(?bool $question6): static
    {
        $this->question6 = $question6;
        return $this;
    }

    public function getQuestion7(): ?bool
    {
        return $this->question7;
    }

    public function setQuestion7(?bool $question7): static
    {
        $this->question7 = $question7;
        return $this;
    }

    public function getQuestion8(): ?bool
    {
        return $this->question8;
    }

    public function setQuestion8(?bool $question8): static
    {
        $this->question8 = $question8;
        return $this;
    }

    public function getQuestion9(): ?bool
    {
        return $this->question9;
    }

    public function setQuestion9(?bool $question9): static
    {
        $this->question9 = $question9;
        return $this;
    }

    public function getQuestion10(): ?bool
    {
        return $this->question10;
    }

    public function setQuestion10(?bool $question10): static
    {
        $this->question10 = $question10;
        return $this;
    }

    /**
     * Convertit les réponses en format JSON pour l'API
     * 
     * @return array
     */
    public function toArray(): array
    {
        return [
            'question1' => $this->question1 ? 'oui' : 'non',
            'question2' => $this->question2 ? 'oui' : 'non',
            'question3' => $this->question3 ? 'oui' : 'non',
            'question4' => $this->question4 ? 'oui' : 'non',
            'question5' => $this->question5 ? 'oui' : 'non',
            'question6' => $this->question6 ? 'oui' : 'non',
            'question7' => $this->question7 ? 'oui' : 'non',
            'question8' => $this->question8 ? 'oui' : 'non',
            'question9' => $this->question9 ? 'oui' : 'non',
            'question10' => $this->question10 ? 'oui' : 'non',
        ];
    }

    /**
     * Met à jour l'entité à partir des données JSON de l'API
     * 
     * @param array $data Données au format ['question1' => 'oui', 'question2' => 'non', etc.]
     * @return self
     */
    public function fromArray(array $data): self
    {
        $this->setQuestion1(isset($data['question1']) ? $data['question1'] === 'oui' : null);
        $this->setQuestion2(isset($data['question2']) ? $data['question2'] === 'oui' : null);
        $this->setQuestion3(isset($data['question3']) ? $data['question3'] === 'oui' : null);
        $this->setQuestion4(isset($data['question4']) ? $data['question4'] === 'oui' : null);
        $this->setQuestion5(isset($data['question5']) ? $data['question5'] === 'oui' : null);
        $this->setQuestion6(isset($data['question6']) ? $data['question6'] === 'oui' : null);
        $this->setQuestion7(isset($data['question7']) ? $data['question7'] === 'oui' : null);
        $this->setQuestion8(isset($data['question8']) ? $data['question8'] === 'oui' : null);
        $this->setQuestion9(isset($data['question9']) ? $data['question9'] === 'oui' : null);
        $this->setQuestion10(isset($data['question10']) ? $data['question10'] === 'oui' : null);
        
        return $this;
    }
}