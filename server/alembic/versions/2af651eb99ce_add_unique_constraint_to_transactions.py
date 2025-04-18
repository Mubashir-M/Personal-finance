"""Add unique constraint to transactions

Revision ID: 2af651eb99ce
Revises: 94d520cb541d
Create Date: 2025-03-15 11:20:03.395497

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2af651eb99ce'
down_revision: Union[str, None] = '94d520cb541d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('transactions', sa.Column('batch_id', sa.UUID(), nullable=False))
    op.drop_constraint('uq_transaction', 'transactions', type_='unique')
    op.create_unique_constraint('uq_transaction_batch', 'transactions', ['user_id', 'amount', 'merchant', 'date', 'batch_id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('uq_transaction_batch', 'transactions', type_='unique')
    op.create_unique_constraint('uq_transaction', 'transactions', ['user_id', 'amount', 'merchant', 'date'])
    op.drop_column('transactions', 'batch_id')
    # ### end Alembic commands ###
