import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from faker import Faker
from faker.providers import internet
from time import sleep
from random import randint
import os
from models import Customer

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

pg_host     = os.environ.get("POSTGRES_HOST")
pg_database = os.environ.get("POSTGRES_DB")
pg_user     = os.environ.get("POSTGRES_USER")
pg_password = os.environ.get("POSTGRES_PASSWORD")
pg_port     = os.environ.get("POSTGRES_PORT")
engine = create_engine(f'postgresql://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_database}')

# Configure data faker.
faker = Faker('en_AU')
faker.add_provider(internet)

while True:
    with Session(engine) as session:
        customer = Customer(name=faker.name(),
                            email=faker.ascii_email(),
                            primary_address=faker.address())
        session.add(customer)
        session.commit()
        logger.info(f'New customer: {customer} written to database.')
    sleep(randint(300, 360))
