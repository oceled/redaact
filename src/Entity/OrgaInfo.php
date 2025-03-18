<?php

namespace App\Entity;

use App\Repository\OrgaInfoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: OrgaInfoRepository::class)]
class OrgaInfo
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;
	
	 #[ORM\Column(length: 255, nullable: true)]
    private ?string $logo = null;

    #[ORM\Column(length: 14, unique: true)]
    private ?string $orgaSiret = null;

    #[ORM\Column(length: 255)]
    private ?string $orgStatus = null;
	
	#[ORM\Column(length: 255, nullable: true)]
    private ?string $procTitle = 'Procédure Qualité';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $procRef = 'ProQ-i';

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    #[Assert\NotNull]
    #[Assert\Range(
        min: 0,
        max: 100,
        notInRangeMessage: 'Le nombre d\'employés doit être entre {{ min }} et {{ max }}',
    )]
    private ?int $orgEmp = 0;

    #[ORM\Column(type: 'json')]
	private ?array $orgCatAct = null;

    #[ORM\Column(type: 'json')]
	private array $orgCert = [];

	#[ORM\Column(type: 'boolean')]
	#[Assert\NotNull(message: "Veuillez faire un choix")]
	private ?bool $orgSubUse = null;

    #[ORM\OneToMany(mappedBy: 'orgaInfo', targetEntity: UserInfo::class)]
	private Collection $userInfos;
	
	#[ORM\OneToMany(mappedBy: 'orgaInfo', targetEntity: OrgaProc::class, orphanRemoval: true)]
    private Collection $orgaProcs;
	
	#[ORM\OneToOne(mappedBy: 'orgaInfo', targetEntity: IndicatorSettings::class, cascade: ['persist', 'remove'])]
	private ?IndicatorSettings $indicatorSettings = null;


    public function __construct()
    {
        $this->userInfos = new ArrayCollection();
		$this->orgaProcs = new ArrayCollection();
    }

	public function getId(): ?int
    {
        return $this->id;
    }
	
	 public function getLogo(): ?string
    {
        return $this->logo;
    }

    public function setLogo(?string $logo): static
    {
        $this->logo = $logo;
        return $this;
    }

	public function getProcTitle(): ?string
    {
        return $this->procTitle;
    }

    public function setProcTitle(?string $procTitle): static
    {
        $this->procTitle = $procTitle;
        return $this;
    }

    public function getProcRef(): ?string
    {
        return $this->procRef;
    }

    public function setProcRef(?string $procRef): static
    {
        $this->procRef = $procRef;
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

    public function getOrgStatus(): ?string
    {
        return $this->orgStatus;
    }

    public function setOrgStatus(string $orgStatus): static
    {
        $this->orgStatus = $orgStatus;
        return $this;
    }

    public function getOrgEmp(): ?int
    {
        return $this->orgEmp;
    }

    public function setOrgEmp(int $orgEmp): static
    {
        $this->orgEmp = $orgEmp;
        return $this;
    }

    public function getOrgCatAct(): ?array
{
    return $this->orgCatAct;
}

	public function setOrgCatAct(?array $orgCatAct): static
	{
		$this->orgCatAct = $orgCatAct;
		return $this;
	}

     public function getOrgCert(): ?array
    {
        return $this->orgCert;
    }

    public function setOrgCert(?array $orgCert): static
    {
        $this->orgCert = $orgCert;
        return $this;
    }

	public function getOrgSubUse(): ?bool  // Changer string en bool
	{
		return $this->orgSubUse;
	}

	public function setOrgSubUse(bool $orgSubUse): static  // Changer string en bool
	{
		$this->orgSubUse = $orgSubUse;
		return $this;
	}

    /**
     * @return Collection<int, OrgaProc>
     */
    public function getOrgaProcs(): Collection
    {
        return $this->orgaProcs;
    }

    public function addOrgaProc(OrgaProc $orgaProc): static
    {
        if (!$this->orgaProcs->contains($orgaProc)) {
            $this->orgaProcs->add($orgaProc);
            $orgaProc->setOrgaInfo($this);
        }

        return $this;
    }

    public function removeOrgaProc(OrgaProc $orgaProc): static
    {
        if ($this->orgaProcs->removeElement($orgaProc)) {
            // set the owning side to null (unless already changed)
            if ($orgaProc->getOrgaInfo() === $this) {
                $orgaProc->setOrgaInfo(null);
            }
        }

        return $this;
    }
	
	/**
	 * @return Collection<int, UserInfo>
	 */
	public function getUserInfos(): Collection
	{
		return $this->userInfos;
	}

	public function addUserInfo(UserInfo $userInfo): static
	{
    if (!$this->userInfos->contains($userInfo)) {
        $this->userInfos->add($userInfo);
        $userInfo->setOrgaInfo($this);
    }
    return $this;
	}
	
	public function removeUserInfo(UserInfo $userInfo): static
	{
    if ($this->userInfos->removeElement($userInfo)) {
        // set the owning side to null (unless already changed)
        if ($userInfo->getOrgaInfo() === $this) {
            $userInfo->setOrgaInfo(null);
        }
    }
    return $this;
	}
	public function getIndicatorSettings(): ?IndicatorSettings
{
    return $this->indicatorSettings;
}

public function setIndicatorSettings(?IndicatorSettings $indicatorSettings): self
{
    // unset the owning side of the relation if necessary
    if ($indicatorSettings === null && $this->indicatorSettings !== null) {
        $this->indicatorSettings->setOrgaInfo(null);
    }

    // set the owning side of the relation if necessary
    if ($indicatorSettings !== null && $indicatorSettings->getOrgaInfo() !== $this) {
        $indicatorSettings->setOrgaInfo($this);
    }

    $this->indicatorSettings = $indicatorSettings;

    return $this;
}
}