<?php

namespace App\Repository;

use App\Entity\IndicatorSettings;
use App\Entity\OrgaInfo;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<IndicatorSettings>
 */
class IndicatorSettingsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, IndicatorSettings::class);
    }

    /**
     * Trouve ou crée les paramètres d'indicateurs pour une organisation
     * 
     * @param OrgaInfo $orgaInfo L'organisation
     * @return IndicatorSettings Les paramètres d'indicateurs
     */
    public function findOrCreate(OrgaInfo $orgaInfo): IndicatorSettings
    {
        $settings = $this->findOneBy(['orgaInfo' => $orgaInfo]);
        
        if (!$settings) {
            $settings = new IndicatorSettings();
            $settings->setOrgaInfo($orgaInfo);
        }
        
        return $settings;
    }

    public function save(IndicatorSettings $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(IndicatorSettings $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}