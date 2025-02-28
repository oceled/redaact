<?php

namespace App\Repository;

use App\Entity\OrgaInd;
use App\Entity\OrgaProc;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<OrgaInd>
 */
class OrgaIndRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, OrgaInd::class);
    }
	
	public function findIndicatorsWithLatestRevisions(OrgaProc $orgaProc): array
{
    return $this->createQueryBuilder('i')
        ->select('i', 'r')
        ->leftJoin('i.revisions', 'r')
        ->where('i.orgaProc = :orgaProc')
        ->andWhere('r.n_vers = (
            SELECT MAX(r2.n_vers)
            FROM App\Entity\IndCrea r2
            WHERE r2.indicator = i
        )')
        ->setParameter('orgaProc', $orgaProc)
        ->orderBy('i.indNumb', 'ASC')
        ->getQuery()
        ->getResult();
}

    //    /**
    //     * @return OrgaInd[] Returns an array of OrgaInd objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('o')
    //            ->andWhere('o.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('o.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?OrgaInd
    //    {
    //        return $this->createQueryBuilder('o')
    //            ->andWhere('o.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
