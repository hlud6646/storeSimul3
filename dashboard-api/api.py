"""
This is a simple read-only API that exposes the database.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import os
from datetime import datetime
import pytz

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8005",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    conn = psycopg2.connect(
        host=os.environ.get("POSTGRES_HOST"),
        database=os.environ.get("POSTGRES_DB"),
        user=os.environ.get("POSTGRES_USER"),
        password=os.environ.get("POSTGRES_PASSWORD"),
        port=os.environ.get("POSTGRES_PORT")
    )
    return conn

@app.get("/recent_orders")
def read_recent_orders():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT po.id, c.name, po.created, po.address
        FROM purchase_order po
        JOIN customer c ON po.customer = c.id
        ORDER BY po.created DESC
        LIMIT 5;
    """)
    orders = cur.fetchall()
    cur.close()
    conn.close()
    
    sydney_tz = pytz.timezone('Australia/Sydney')
    
    return [{ 
        "id": o[0], 
        "customer": o[1], 
        "date": o[2].astimezone(sydney_tz).isoformat(), 
        "address": o[3] 
    } for o in orders]

@app.get("/top_products")
def read_top_products():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.id, p.name, SUM(pop.quantity) as total_sales
        FROM product p
        JOIN purchase_order_products pop ON p.id = pop.product
        GROUP BY p.id, p.name
        ORDER BY total_sales DESC
        LIMIT 5;
    """)
    products = cur.fetchall()
    cur.close()
    conn.close()
    return [{ "id": p[0], "name": p[1], "sales": p[2] } for p in products]

@app.get("/new_customers")
def read_new_customers():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, name, email, created
        FROM customer
        ORDER BY created DESC
        LIMIT 5;
    """)
    customers = cur.fetchall()
    cur.close()
    conn.close()
    
    sydney_tz = pytz.timezone('Australia/Sydney')
    
    return [{ 
        "id": c[0], 
        "name": c[1], 
        "email": c[2], 
        "joined": c[3].astimezone(sydney_tz).isoformat() 
    } for c in customers]


@app.get("/orders_over_time")
def read_orders_over_time():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM (
            SELECT
                to_timestamp(floor((extract(epoch from created) / 1200)) * 1200) as time_window,
                COUNT(id) as order_count
            FROM
                purchase_order
            GROUP BY
                time_window
            ORDER BY
                time_window DESC
            LIMIT 6
        ) as recent_orders
        ORDER BY
            time_window ASC;
    """)
    orders_data = cur.fetchall()
    cur.close()
    conn.close()
    
    # Convert UTC timestamps to Sydney timezone and format as ISO string
    sydney_tz = pytz.timezone('Australia/Sydney')
    
    return [{ 
        "date": row[0].replace(tzinfo=pytz.UTC).astimezone(sydney_tz).isoformat(), 
        "orders": row[1] 
    } for row in orders_data]



@app.get("/top_customers")
def read_top_customers():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT c.name, COUNT(po.id) as order_count
        FROM customer c
        JOIN purchase_order po ON c.id = po.customer
        GROUP BY c.name
        ORDER BY order_count DESC
        LIMIT 5;
    """)
    customers = cur.fetchall()
    cur.close()
    conn.close()
    return [{ "name": c[0], "orders": c[1] } for c in customers]

@app.get("/product_supply_resilience")
def read_product_supply_resilience():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT
            p.name,
            p.inventory,
            COUNT(sp.supplier_id) AS supplier_count
        FROM
            product p
        JOIN
            supplier_products sp ON p.id = sp.product_id
        GROUP BY
            p.id, p.name, p.inventory
        HAVING
            COUNT(sp.supplier_id) > 0
        ORDER BY
            (CASE WHEN COUNT(sp.supplier_id) = 1 THEN 1 WHEN COUNT(sp.supplier_id) = 2 THEN 2 ELSE 3 END), 
            supplier_count ASC
        LIMIT 5;
    """)
    products = cur.fetchall()
    cur.close()
    conn.close()
    return [{"name": p[0], "inventory": p[1], "suppliers": p[2]} for p in products]

@app.get("/supplier_product_proportion")
def read_supplier_product_proportion():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT count(*) FROM product;")
    total_products = cur.fetchone()[0]

    if total_products == 0:
        cur.close()
        conn.close()
        return []

    cur.execute("""
        SELECT
            s.name,
            count(sp.product_id) as product_count
        FROM supplier s
        JOIN supplier_products sp on s.id = sp.supplier_id
        GROUP BY s.name
        ORDER BY product_count DESC
        LIMIT 5;
    """)
    supplier_proportions = cur.fetchall()
    cur.close()
    conn.close()

    return [{
        "name": row[0],
        "proportion": (row[1] / total_products) if total_products > 0 else 0
    } for row in supplier_proportions]

@app.get("/products_by_department")
def read_products_by_department():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT department, count(id) as product_count
        FROM product
        GROUP BY department
        ORDER BY product_count DESC
    """)
    data = cur.fetchall()
    cur.close()
    conn.close()
    return [{ "department": row[0], "count": row[1] } for row in data]

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8005)))
