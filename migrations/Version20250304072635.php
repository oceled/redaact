<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250304072635 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE ind_crea (id INT AUTO_INCREMENT NOT NULL, ind_numb INT NOT NULL, ind_redac VARCHAR(255) NOT NULL, ind_approb VARCHAR(255) DEFAULT NULL, d_create DATETIME NOT NULL, n_vers INT NOT NULL, INDEX IDX_4F06CE8A2057902 (ind_numb), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE ind_doc (id INT AUTO_INCREMENT NOT NULL, indd_numb INT DEFAULT NULL, indd_def LONGTEXT DEFAULT NULL, indd_adv LONGTEXT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE ind_updt (id INT AUTO_INCREMENT NOT NULL, revision_id INT NOT NULL, d_updt DATETIME NOT NULL, n_vers INT NOT NULL, motif LONGTEXT DEFAULT NULL, ind_redac VARCHAR(255) NOT NULL, ind_approb VARCHAR(255) DEFAULT NULL, INDEX IDX_6C0656F1DFA7C8F (revision_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE indicator_settings (id INT AUTO_INCREMENT NOT NULL, orga_info_id INT NOT NULL, question1 TINYINT(1) DEFAULT NULL, question2 TINYINT(1) DEFAULT NULL, question3 TINYINT(1) DEFAULT NULL, question4 TINYINT(1) DEFAULT NULL, UNIQUE INDEX UNIQ_8BA7F616B39FAB26 (orga_info_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE notification (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, orga_siret VARCHAR(14) NOT NULL, type VARCHAR(50) NOT NULL, message LONGTEXT NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_BF5476CAA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE orga_ind (ind_numb INT NOT NULL, ind_name VARCHAR(255) DEFAULT NULL, ind_object LONGTEXT DEFAULT NULL, ind_voc LONGTEXT DEFAULT NULL, ind_detail LONGTEXT DEFAULT NULL, ind_files LONGTEXT DEFAULT NULL, orgaProcNumb INT NOT NULL, INDEX IDX_C374C150AC814637 (orgaProcNumb), PRIMARY KEY(ind_numb)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE orga_info (id INT AUTO_INCREMENT NOT NULL, logo VARCHAR(255) DEFAULT NULL, orga_siret VARCHAR(14) NOT NULL, org_status VARCHAR(255) NOT NULL, proc_title VARCHAR(255) DEFAULT NULL, proc_ref VARCHAR(255) DEFAULT NULL, org_emp INT DEFAULT 0 NOT NULL, org_cat_act JSON NOT NULL, org_cert JSON NOT NULL, org_sub_use TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_5691D4F3F7CF3C66 (orga_siret), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE orga_proc (orgaProcNumb INT AUTO_INCREMENT NOT NULL, orga_siret VARCHAR(14) NOT NULL, orgaInfo_id INT NOT NULL, INDEX IDX_B6C86190710EEDE5 (orgaInfo_id), PRIMARY KEY(orgaProcNumb)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, first_name VARCHAR(50) NOT NULL, last_name VARCHAR(50) NOT NULL, UNIQUE INDEX UNIQ_8D93D649E7927C74 (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_info (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, orga_info_id INT DEFAULT NULL, orga_siret VARCHAR(14) NOT NULL, orga_name VARCHAR(255) NOT NULL, is_principal TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_B1087D9EA76ED395 (user_id), INDEX IDX_B1087D9EB39FAB26 (orga_info_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', available_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', delivered_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_75EA56E0FB7336F0 (queue_name), INDEX IDX_75EA56E0E3BD61CE (available_at), INDEX IDX_75EA56E016BA31DB (delivered_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE ind_crea ADD CONSTRAINT FK_4F06CE8A2057902 FOREIGN KEY (ind_numb) REFERENCES orga_ind (ind_numb)');
        $this->addSql('ALTER TABLE ind_updt ADD CONSTRAINT FK_6C0656F1DFA7C8F FOREIGN KEY (revision_id) REFERENCES ind_crea (id)');
        $this->addSql('ALTER TABLE indicator_settings ADD CONSTRAINT FK_8BA7F616B39FAB26 FOREIGN KEY (orga_info_id) REFERENCES orga_info (id)');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_BF5476CAA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE orga_ind ADD CONSTRAINT FK_C374C150AC814637 FOREIGN KEY (orgaProcNumb) REFERENCES orga_proc (orgaProcNumb)');
        $this->addSql('ALTER TABLE orga_proc ADD CONSTRAINT FK_B6C86190710EEDE5 FOREIGN KEY (orgaInfo_id) REFERENCES orga_info (id)');
        $this->addSql('ALTER TABLE user_info ADD CONSTRAINT FK_B1087D9EA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user_info ADD CONSTRAINT FK_B1087D9EB39FAB26 FOREIGN KEY (orga_info_id) REFERENCES orga_info (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE ind_crea DROP FOREIGN KEY FK_4F06CE8A2057902');
        $this->addSql('ALTER TABLE ind_updt DROP FOREIGN KEY FK_6C0656F1DFA7C8F');
        $this->addSql('ALTER TABLE indicator_settings DROP FOREIGN KEY FK_8BA7F616B39FAB26');
        $this->addSql('ALTER TABLE notification DROP FOREIGN KEY FK_BF5476CAA76ED395');
        $this->addSql('ALTER TABLE orga_ind DROP FOREIGN KEY FK_C374C150AC814637');
        $this->addSql('ALTER TABLE orga_proc DROP FOREIGN KEY FK_B6C86190710EEDE5');
        $this->addSql('ALTER TABLE user_info DROP FOREIGN KEY FK_B1087D9EA76ED395');
        $this->addSql('ALTER TABLE user_info DROP FOREIGN KEY FK_B1087D9EB39FAB26');
        $this->addSql('DROP TABLE ind_crea');
        $this->addSql('DROP TABLE ind_doc');
        $this->addSql('DROP TABLE ind_updt');
        $this->addSql('DROP TABLE indicator_settings');
        $this->addSql('DROP TABLE notification');
        $this->addSql('DROP TABLE orga_ind');
        $this->addSql('DROP TABLE orga_info');
        $this->addSql('DROP TABLE orga_proc');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE user_info');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
