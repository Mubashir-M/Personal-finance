"""Add unique constraint to transactions

Revision ID: 94d520cb541d
Revises: 9341859290ec
Create Date: 2025-03-15 10:16:55.290695

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '94d520cb541d'
down_revision: Union[str, None] = '9341859290ec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint('uq_transaction', 'transactions', ['user_id', 'amount', 'merchant', 'date'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('uq_transaction', 'transactions', type_='unique')
    # ### end Alembic commands ###
