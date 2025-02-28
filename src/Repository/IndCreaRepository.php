<?php

namespace App\Repository;

use App\Entity\IndCrea;  // Changé
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class IndCreaRepository extends ServiceEntityRepository  // Changé
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, IndCrea::class);  // Changé
    }
}