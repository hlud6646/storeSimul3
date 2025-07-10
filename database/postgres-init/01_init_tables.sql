CREATE TABLE product
(
    id         serial primary key,
    name       text    NOT NULL,
    material   text,
    color      text,
    department text,
    inventory  integer NOT NULL
);

CREATE TABLE inventory_modification
(
    modified_at   timestamptz DEFAULT now() NOT NULL,
    old_inventory integer                   NOT NULL,
    new_inventory integer                   NOT NULL,
    employee      text                      NOT NULL,
    product       integer                   NOT NULL references product (id)
);

CREATE TABLE supplier
(
    id      serial primary key,
    name    text NOT NULL,
    address text,
    phone   text NOT NULL,
    email   text NOT NULL,
    CONSTRAINT check_email CHECK ((email ~~ '%@%'::text))
);

CREATE TABLE supplier_products
(
    supplier_id integer NOT NULL references supplier (id),
    product_id  integer NOT NULL references product (id),
    price       bigint  NOT NULL,
    CONSTRAINT check_price CHECK ((price > 0)),
    primary key (supplier_id, product_id)
);


CREATE TABLE customer
(
    email           text unique,
    id              serial primary key,
    name            text                      NOT NULL,
    created         timestamptz default now() NOT NULL,
    primary_address text                      not null,
    CONSTRAINT check_email CHECK ((email ~~ '%@%'::text))
);

CREATE TABLE purchase_order
(
    id         serial primary key,
    customer   integer                   NOT NULL references customer (id),
    created    timestamptz DEFAULT now() NOT NULL,
    packed     timestamptz,
    dispatched timestamptz,
    address    text                      NOT NULL
);

CREATE TABLE purchase_order_products
(
    purchase_order integer NOT NULL references purchase_order (id),
    product        integer NOT NULL references product (id),
    quantity       integer NOT NULL,
    CONSTRAINT quantity_positive CHECK ((quantity > 0)),
    primary key(purchase_order, product)
);
