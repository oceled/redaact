<?php
// IndUpdtRepository.php
namespace App\Repository;

use App\Entity\IndUpdt;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class IndUpdtRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, IndUpdt::class);
    }
}