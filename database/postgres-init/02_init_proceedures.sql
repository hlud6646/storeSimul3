--
-- Welcome Gift
-- Send new customers a welcome gift.
--
-- This is just a 'Look Mum: No Hands!' example to show how to use triggers.



create or replace function send_welcome_product() returns trigger as
$welcome_product$
declare
    product_id        integer;
    purchase_order_id integer;
begin
    -- Create a new order for this customer, keeping the order_id.
    insert into purchase_order(customer, address)
    values (NEW.id, NEW.primary_address)
    returning id into purchase_order_id;

    -- Decrement the inventory of a randomly selected product and keep the id.
    select id
    into product_id
    from product
    where product.inventory >= 1
    order by random()
    limit 1;
    update product set inventory = inventory - 1 where id = product_id;

    -- Add this product to the new order.
    insert into purchase_order_products(purchase_order, product, quantity)
    values (purchase_order_id, product_id, 1);

    raise notice 'New customer: %', NEW.id;
    raise notice 'Created order %', purchase_order_id;
    raise notice 'Added product % to order', product_id;

    -- Return is ignored since this is an AFTER trigger, but the editor wants one.
    return NULL;
end;

$welcome_product$ language plpgsql;


create or replace trigger welcome_product
    after insert
    on customer
    for each row
execute function send_welcome_product();

--
-- Employee Audit
--
-- To try and identify inventory inconsistencies, we now record any modifications.

create or replace function record_inventory_modification() returns trigger as
$record_inventory_modification$
begin
    insert into inventory_modification
    values (now(),
            OLD.inventory,
            NEW.inventory,
            current_user,
            NEW.id);
    return null;
end;
$record_inventory_modification$ language plpgsql;


create or replace trigger inventory_audit
    after update
    on product
    for each row
execute function record_inventory_modification();
