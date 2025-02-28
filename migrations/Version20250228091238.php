<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250228091238 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE indicator_settings DROP question7, DROP question8, DROP question9, DROP question10');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE indicator_settings ADD question7 TINYINT(1) DEFAULT NULL, ADD question8 TINYINT(1) DEFAULT NULL, ADD question9 TINYINT(1) DEFAULT NULL, ADD question10 TINYINT(1) DEFAULT NULL');
    }
}
