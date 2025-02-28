<?php

namespace App\Entity;

use App\Repository\IndDocRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: IndDocRepository::class)]
class IndDoc
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(nullable: true)]
    private ?int $indd_numb = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $indd_def = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $indd_adv = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getInddNumb(): ?int
    {
        return $this->indd_numb;
    }

    public function setInddNumb(?int $indd_numb): static
    {
        $this->indd_numb = $indd_numb;

        return $this;
    }

    public function getInddDef(): ?string
    {
        return $this->indd_def;
    }

    public function setInddDef(?string $indd_def): static
    {
        $this->indd_def = $indd_def;

        return $this;
    }

    public function getInddAdv(): ?string
    {
        return $this->indd_adv;
    }

    public function setInddAdv(?string $indd_adv): static
    {
        $this->indd_adv = $indd_adv;

        return $this;
    }
}
