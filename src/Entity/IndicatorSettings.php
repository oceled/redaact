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

    // Méthodes getters et setters standards
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getOrgaInfo(): ?OrgaInfo
    {
        return $this->orgaInfo;
    }

    public function setOrgaInfo(?OrgaInfo $orgaInfo): self
    {
        $this->orgaInfo = $orgaInfo;
        return $this;
    }

    // Getters et setters génériques pour éviter la répétition
    public function getQuestion(int $number): ?bool
    {
        $method = 'question' . $number;
        return $this->$method;
    }

    public function setQuestion(int $number, ?bool $value): self
    {
        $method = 'setQuestion' . $number;
        $this->$method($value);
        return $this;
    }

    // Méthodes individuelles pour compatibilité
    public function getQuestion1(): ?bool { return $this->question1; }
    public function setQuestion1(?bool $question1): self { $this->question1 = $question1; return $this; }
    public function getQuestion2(): ?bool { return $this->question2; }
    public function setQuestion2(?bool $question2): self { $this->question2 = $question2; return $this; }
    public function getQuestion3(): ?bool { return $this->question3; }
    public function setQuestion3(?bool $question3): self { $this->question3 = $question3; return $this; }
    public function getQuestion4(): ?bool { return $this->question4; }
    public function setQuestion4(?bool $question4): self { $this->question4 = $question4; return $this; }

    /**
     * Convertit les réponses en format JSON pour l'API
     */
    public function toArray(): array
    {
        $result = [];
        for ($i = 1; $i <= 4; $i++) {
            $getter = "getQuestion{$i}";
            $result["question{$i}"] = $this->$getter() ? 'oui' : 'non';
        }
        return $result;
    }

    /**
     * Met à jour l'entité à partir des données JSON de l'API
     */
    public function fromArray(array $data): self
    {
        for ($i = 1; $i <= 4; $i++) {
            $questionKey = "question{$i}";
            $setter = "setQuestion{$i}";
            
            if (isset($data[$questionKey])) {
                $this->$setter($data[$questionKey] === 'oui');
            }
        }
        
        return $this;
    }

    /**
     * Convertit les valeurs de l'entité en booléens
     */
    public function toBooleanArray(): array
    {
        $result = [];
        for ($i = 1; $i <= 4; $i++) {
            $getter = "getQuestion{$i}";
            $result["question{$i}"] = $this->$getter();
        }
        return $result;
    }
}