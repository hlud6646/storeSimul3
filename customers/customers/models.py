from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

class Base(DeclarativeBase):
    pass

class Customer(Base):
    __tablename__                = "customer"
    id: Mapped[int]              = mapped_column(primary_key=True)
    name: Mapped[str]            = mapped_column(String())
    email: Mapped[str]           = mapped_column(String())
    primary_address: Mapped[str] = mapped_column(String())
    def __repr__(self) -> str:
        return f"Customer(id:{self.id}, name:{self.name}, email:{self.email})"
