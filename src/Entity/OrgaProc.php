<?php

namespace App\Entity;

use App\Repository\OrgaProcRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: OrgaProcRepository::class)]
class OrgaProc
{
    #[ORM\Id]
    #[ORM\Column(name: "orgaProcNumb")]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $orgaProcNumb = null;

    #[ORM\Column(length: 14)]
    private ?string $orgaSiret = null;

    #[ORM\ManyToOne(inversedBy: "orgaProcs")]
    #[ORM\JoinColumn(name: "orgaInfo_id", referencedColumnName: "id", nullable: false)]
    private ?OrgaInfo $orgaInfo = null;

    #[ORM\OneToMany(mappedBy: 'orgaProc', targetEntity: OrgaInd::class)]
    private Collection $orgaInds;

    public function __construct()
    {
        $this->orgaInds = new ArrayCollection();
    }

    public function getOrgaProcNumb(): ?int
    {
        return $this->orgaProcNumb;
    }

    public function getOrgaInds(): Collection
    {
        return $this->orgaInds;
    }

    public function addOrgaInd(OrgaInd $orgaInd): static
    {
        if (!$this->orgaInds->contains($orgaInd)) {
            $this->orgaInds->add($orgaInd);
            $orgaInd->setOrgaProc($this);
        }
        return $this;
    }

    public function removeOrgaInd(OrgaInd $orgaInd): static
    {
        if ($this->orgaInds->removeElement($orgaInd)) {
            if ($orgaInd->getOrgaProc() === $this) {
                $orgaInd->setOrgaProc(null);
            }
        }
        return $this;
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

    public function getOrgaSiret(): ?string
    {
        return $this->orgaSiret;
    }

    public function setOrgaSiret(string $orgaSiret): static
    {
        $this->orgaSiret = $orgaSiret;
        return $this;
    }
}