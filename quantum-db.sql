DROP TABLE IF EXISTS venda, produto, categoria, cliente CASCADE;

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone BIGINT NOT NULL UNIQUE,
    endereco VARCHAR(150) NOT NULL
);

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    descricao TEXT NOT NULL
);

CREATE TABLE produto (
    id_produto SERIAL PRIMARY KEY,
    id_categoria INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(19, 2) NOT NULL,
    validade DATE,
    CONSTRAINT id_categoria_fk FOREIGN KEY (id_categoria)
        REFERENCES categoria (id_categoria) ON DELETE CASCADE
);

CREATE TABLE venda (
    id_venda SERIAL PRIMARY KEY,
    data_venda DATE DEFAULT CURRENT_DATE,
    id_cliente INT,
    id_produto INT,
    preco DECIMAL(10, 2) NOT NULL,
    enviar_nota BOOL DEFAULT false,
    CONSTRAINT venda_cliente_fk FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON DELETE RESTRICT,
    CONSTRAINT venda_produto_fk FOREIGN KEY (id_produto)
        REFERENCES produto (id_produto) ON DELETE RESTRICT
);
