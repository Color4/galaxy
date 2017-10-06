"""
Migration script to create a table for PluggedMedia, and extend the HDA table accordingly.
"""
from __future__ import print_function

import datetime
import logging

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, MetaData, Table, TEXT

now = datetime.datetime.utcnow
log = logging.getLogger(__name__)
metadata = MetaData()

# Table to add

PluggedMediaTable = Table("plugged_media", metadata,
                          Column("id", Integer, primary_key=True),
                          Column("create_time", DateTime, default=now),
                          Column("update_time", DateTime, default=now, onupdate=now),
                          Column("user_id", Integer, ForeignKey("galaxy_user.id"), index=True),
                          Column("hierarchy", TEXT),
                          Column("category", TEXT, default="local"),
                          Column("path", TEXT),
                          Column("secret_key", TEXT),
                          Column("access_key", TEXT),
                          Column("deleted", Boolean, index=True, default=False),
                          Column("purged", Boolean, index=True, default=False),
                          Column("purgable", Boolean, default=True))

plugged_media_id_col = Column("plugged_media_id", Integer, ForeignKey("plugged_media.id"))
dataset_path_to_media_col = Column("dataset_path_on_media", TEXT)


def upgrade(migrate_engine):
    print(__doc__)
    metadata.bind = migrate_engine
    metadata.reflect()

    # Create PluggedMedia table
    try:
        PluggedMediaTable.create()
    except Exception as e:
        log.debug("Creating plugged_media table failed: %s" % str(e))

    # Extend HDA table
    hda_table = Table("history_dataset_association", metadata, autoload=True)
    try:
        plugged_media_id_col.create(hda_table)
        assert plugged_media_id_col is hda_table.c.plugged_media_id
    except Exception as e:
        print(str(e))
        log.error("Adding column 'plugged_media_id' to 'history_dataset_association' table failed: %s" % str(e))
    try:
        dataset_path_to_media_col.create(hda_table)
        assert dataset_path_to_media_col is hda_table.c.dataset_path_on_media
    except Exception as e:
        print(str(e))
        log.error("Adding column 'dataset_path_on_media' to 'history_dataset_association' table failed: %s" % str(e))


def downgrade(migrate_engine):
    metadata.bind = migrate_engine
    metadata.reflect()

    # Drop plugged_media table
    try:
        PluggedMediaTable.drop()
    except Exception as e:
        log.debug("Dropping plugged_media table failed: %s" % str(e))

    # Drop the HDA table's extended 'plugged media' and 'dataset path' columns.
    hda_table = Table("history_dataset_association", metadata, autoload=True)
    try:
        plugged_media_id = hda_table.c.plugged_media_id
        plugged_media_id.drop()
    except Exception as e:
        log.debug("Dropping 'plugged_media_id' column from history_dataset_association table failed: %s" % (str(e)))
    try:
        dataset_path_on_media = hda_table.c.dataset_path_on_media
        dataset_path_on_media.drop()
    except Exception as e:
        log.debug("Dropping 'dataset_path_on_media' column from history_dataset_association table failed: %s" % (str(e)))