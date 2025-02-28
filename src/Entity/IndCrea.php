<?php

namespace App\Entity;

use App\Repository\IndCreaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: IndCreaRepository::class)]
class IndCrea
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $ind_redac = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $ind_approb = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $d_create = null;

    #[ORM\Column]
    private ?int $n_vers = null;

    // Cette propriété peut être supprimée car elle sera gérée par IndUpdt
    // #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    // private ?\DateTimeInterface $d_updt = null;

    #[ORM\ManyToOne(inversedBy: "revisions")]
    #[ORM\JoinColumn(name: "ind_numb", referencedColumnName: "ind_numb", nullable: false)]
    private ?OrgaInd $indicator = null;

    #[ORM\OneToMany(mappedBy: 'revision', targetEntity: IndUpdt::class, orphanRemoval: true)]
    private Collection $updates;

    public function __construct()
    {
        $this->d_create = new \DateTime();
        $this->n_vers = 1;
        $this->updates = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIndRedac(): ?string
    {
        return $this->ind_redac;
    }

    public function setIndRedac(string $ind_redac): static
    {
        $this->ind_redac = $ind_redac;
        return $this;
    }

    public function getIndApprob(): ?string
    {
        return $this->ind_approb;
    }

    public function setIndApprob(?string $ind_approb): static
	{
    $this->ind_approb = $ind_approb;
    return $this;
	}

    public function getDCreate(): ?\DateTimeInterface
    {
        return $this->d_create;
    }

    public function setDCreate(\DateTimeInterface $d_create): static
    {
        $this->d_create = $d_create;
        return $this;
    }

    public function getNVers(): ?int
    {
        return $this->n_vers;
    }

    public function setNVers(int $n_vers): static
    {
        $this->n_vers = $n_vers;
        return $this;
    }

    // Cette méthode peut être modifiée pour utiliser IndUpdt
    public function getLastUpdateDate(): ?\DateTimeInterface
    {
        return $this->getLatestUpdate()?->getDUpdt() ?? $this->d_create;
    }

    public function getIndicator(): ?OrgaInd
    {
        return $this->indicator;
    }

    public function setIndicator(?OrgaInd $indicator): static
    {
        $this->indicator = $indicator;
        return $this;
    }

    /**
     * @return Collection<int, IndUpdt>
     */
    public function getUpdates(): Collection
    {
        return $this->updates;
    }

    public function addUpdate(IndUpdt $update): static
    {
        if (!$this->updates->contains($update)) {
            $this->updates->add($update);
            $update->setRevision($this);
        }
        return $this;
    }

    public function removeUpdate(IndUpdt $update): static
    {
        if ($this->updates->removeElement($update)) {
            if ($update->getRevision() === $this) {
                $update->setRevision(null);
            }
        }
        return $this;
    }

    public function getLatestUpdate(): ?IndUpdt
    {
        if ($this->updates->isEmpty()) {
            return null;
        }
        return $this->updates->last();
    }
}