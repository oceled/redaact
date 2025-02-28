<?php
namespace App\Entity;

use App\Repository\IndUpdtRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: IndUpdtRepository::class)]
class IndUpdt
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $d_updt = null;

    #[ORM\Column]
    private ?int $n_vers = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $motif = null;
	
	#[ORM\Column(length: 255)]
    private ?string $ind_redac = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $ind_approb = null;

    #[ORM\ManyToOne(inversedBy: 'updates')]
    #[ORM\JoinColumn(nullable: false)]
    private ?IndCrea $revision = null;

    public function __construct()
    {
        $this->d_updt = new \DateTime();
        $this->n_vers = 1;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDUpdt(): ?\DateTimeInterface
    {
        return $this->d_updt;
    }

    public function setDUpdt(\DateTimeInterface $d_updt): static
    {
        $this->d_updt = $d_updt;
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

    public function getMotif(): ?string
    {
        return $this->motif;
    }

    public function setMotif(?string $motif): static
    {
        $this->motif = $motif;
        return $this;
    }

    public function getRevision(): ?IndCrea
    {
        return $this->revision;
    }

    public function setRevision(?IndCrea $revision): static
    {
        $this->revision = $revision;
        return $this;
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
}