<?php

namespace App\Entity;

use App\Repository\OrgaIndRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrgaIndRepository::class)]
class OrgaInd
{
    #[ORM\Id]
    #[ORM\Column(type: "integer")]
    private ?int $indNumb = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $indName = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $indObject = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $indVoc = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $indDetail = null;

    #[ORM\ManyToOne(inversedBy: "orgaInds")]
    #[ORM\JoinColumn(name: "orgaProcNumb", referencedColumnName: "orgaProcNumb", nullable: false)]
    private ?OrgaProc $orgaProc = null;

    #[ORM\OneToMany(mappedBy: 'indicator', targetEntity: IndCrea::class, orphanRemoval: true)]
    private Collection $revisions;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $indFiles = null;

    public function __construct()
    {
        $this->revisions = new ArrayCollection();
    }

    public function getIndNumb(): ?int
    {
        return $this->indNumb;
    }

    public function setIndNumb(int $indNumb): static
    {
        $this->indNumb = $indNumb;
        return $this;
    }

    public function getIndName(): ?string
    {
        return $this->indName;
    }

    public function setIndName(?string $indName): static
    {
        $this->indName = $indName;
        return $this;
    }

    public function getIndObject(): ?string
    {
        return $this->indObject;
    }

    public function setIndObject(?string $indObject): static
    {
        $this->indObject = $indObject;
        return $this;
    }

    public function getIndVoc(): ?string
    {
        return $this->indVoc;
    }

    public function setIndVoc(?string $indVoc): static
    {
        $this->indVoc = $indVoc;
        return $this;
    }

    public function getIndDetail(): ?string
    {
        return $this->indDetail;
    }

    public function setIndDetail(?string $indDetail): static
    {
        $this->indDetail = $indDetail;
        return $this;
    }

    public function getOrgaProc(): ?OrgaProc
    {
        return $this->orgaProc;
    }

    public function setOrgaProc(?OrgaProc $orgaProc): static
    {
        $this->orgaProc = $orgaProc;
        return $this;
    }

    /**
     * @return Collection<int, IndCrea>
     */
    public function getRevisions(): Collection
    {
        return $this->revisions;
    }

    public function addRevision(IndCrea $revision): static
    {
        if (!$this->revisions->contains($revision)) {
            $this->revisions->add($revision);
            $revision->setIndicator($this);
        }
        return $this;
    }
	
	public function getLatestRevision(): ?IndCrea
    {
        if ($this->revisions->isEmpty()) {
            return null;
        }
        return $this->revisions->last();
    }

    public function removeRevision(IndCrea $revision): static
    {
        if ($this->revisions->removeElement($revision)) {
            if ($revision->getIndicator() === $this) {
                $revision->setIndicator(null);
            }
        }
        return $this;
    }

    public function getIndFiles(): ?string
    {
        return $this->indFiles;
    }

    public function setIndFiles(?string $indFiles): static
    {
        $this->indFiles = $indFiles;
        return $this;
    }
	
	public function getIndRedac(): ?string
    {
        return $this->getLatestRevision()?->getIndRedac();
    }

    public function getIndApprob(): ?string
    {
        return $this->getLatestRevision()?->getIndApprob();
    }
}