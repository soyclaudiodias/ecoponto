-- 1. Criar o banco de dados, se ainda não existir
DROP DATABASE IF EXISTS ecoponto;
CREATE DATABASE IF NOT EXISTS ecoponto;

-- 2. Usar o banco de dados
USE ecoponto;

-- 3. Criar a tabela ponto_coleta com colunas booleanas para cada tipo de resíduo
CREATE TABLE ponto_coleta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255),
    whatsapp VARCHAR(20),
    cep VARCHAR(10),
    complemento VARCHAR(255),
    imagem VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    endereco VARCHAR(255),
    reciclaveis BOOLEAN DEFAULT FALSE,
    organicos BOOLEAN DEFAULT FALSE,
    eletronicos BOOLEAN DEFAULT FALSE,
    pilhas_baterias BOOLEAN DEFAULT FALSE,
    oleo_cozinha BOOLEAN DEFAULT FALSE,
    lampadas BOOLEAN DEFAULT FALSE
);

-- 4. Inserir dados de teste
INSERT INTO ponto_coleta (
    nome, email, whatsapp, cep, complemento, imagem, latitude, longitude, endereco,
    reciclaveis, organicos, eletronicos, pilhas_baterias, oleo_cozinha, lampadas
)
VALUES 
    (
        'Ponto A', 'contato@pontoa.com', '11987654321', '01302-907', NULL, NULL,
        -23.54905440, -46.65220850, 'Rua da Consolação, 930',
        TRUE, FALSE, TRUE, TRUE, FALSE, TRUE
    );

-- 5. Verificar os dados inseridos
SELECT * FROM ponto_coleta;