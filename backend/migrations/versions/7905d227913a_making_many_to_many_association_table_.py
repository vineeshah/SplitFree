"""making many to many association table and enabling multiple expenses

Revision ID: 7905d227913a
Revises: 06f09d8897e2
Create Date: 2025-04-02 12:08:16.216404

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7905d227913a'
down_revision = '06f09d8897e2'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('expense', schema=None) as batch_op:
        batch_op.drop_constraint('expense_user_id_fkey', type_='foreignkey')
        batch_op.drop_column('user_id')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('expense', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.create_foreign_key('expense_user_id_fkey', 'user', ['user_id'], ['id'])

    # ### end Alembic commands ###
