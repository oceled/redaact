<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250224143757 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE indicator_settings (id INT AUTO_INCREMENT NOT NULL, orga_info_id INT NOT NULL, question1 TINYINT(1) DEFAULT NULL, question2 TINYINT(1) DEFAULT NULL, question3 TINYINT(1) DEFAULT NULL, question4 TINYINT(1) DEFAULT NULL, question5 TINYINT(1) DEFAULT NULL, question6 TINYINT(1) DEFAULT NULL, question7 TINYINT(1) DEFAULT NULL, question8 TINYINT(1) DEFAULT NULL, question9 TINYINT(1) DEFAULT NULL, question10 TINYINT(1) DEFAULT NULL, UNIQUE INDEX UNIQ_8BA7F616B39FAB26 (orga_info_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE indicator_settings ADD CONSTRAINT FK_8BA7F616B39FAB26 FOREIGN KEY (orga_info_id) REFERENCES orga_info (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE indicator_settings DROP FOREIGN KEY FK_8BA7F616B39FAB26');
        $this->addSql('DROP TABLE indicator_settings');
    }
}
