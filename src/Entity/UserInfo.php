<?php

namespace App\Entity;

use App\Repository\UserInfoRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserInfoRepository::class)]
class UserInfo
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

	#[ORM\OneToOne(inversedBy: 'userInfo', cascade: ['persist', 'remove'])]
	#[ORM\JoinColumn(nullable: false)]
	private ?User $user = null;

    #[ORM\Column(length: 14)]
    private ?string $orgaSiret = null;

    #[ORM\Column(length: 255)]
    private ?string $orgaName = null;

    #[ORM\ManyToOne(inversedBy: 'userInfos', cascade: ['persist'])]
	#[ORM\JoinColumn(nullable: true)]
	private ?OrgaInfo $orgaInfo = null;

    #[ORM\Column]
    private ?bool $isPrincipal = false;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;
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

    public function getOrgaName(): ?string
    {
        return $this->orgaName;
    }

    public function setOrgaName(string $orgaName): static
    {
        $this->orgaName = $orgaName;
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

    public function isIsPrincipal(): ?bool
    {
        return $this->isPrincipal;
    }

    public function setIsPrincipal(bool $isPrincipal): static
    {
        $this->isPrincipal = $isPrincipal;
        return $this;
    }
}