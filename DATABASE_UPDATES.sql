-- =====================================================
-- DATABASE UPDATES FOR CHAT FUNCTIONALITY
-- =====================================================
-- Run these SQL commands on your Azure SQL database to add missing columns

-- =====================================================
-- 1. ADD COLUMNS TO USER TABLE (Optional but recommended)
-- =====================================================
-- These columns will help track when users are created and updated
-- Currently the endpoints use 'dte' as the creation date and return null for updatedat

-- Add createdat column (we'll keep 'dte' and also add this for clarity)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[User]') AND name = 'createdat')
BEGIN
    ALTER TABLE [dbo].[User]
    ADD [createdat] [datetime] NULL;

    -- Set createdat to existing dte value for existing records
    UPDATE [dbo].[User]
    SET [createdat] = [dte]
    WHERE [dte] IS NOT NULL;
END
GO

-- Add updatedat column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[User]') AND name = 'updatedat')
BEGIN
    ALTER TABLE [dbo].[User]
    ADD [updatedat] [datetime] NULL;
END
GO

-- =====================================================
-- 2. ADD COLUMN TO CONVERSATION TABLE (Optional but recommended)
-- =====================================================
-- This will help track when conversations are last updated

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[conversation]') AND name = 'updated_at')
BEGIN
    ALTER TABLE [dbo].[conversation]
    ADD [updated_at] [datetime] NULL;

    -- Set updated_at to created_at for existing records
    UPDATE [dbo].[conversation]
    SET [updated_at] = [created_at]
    WHERE [created_at] IS NOT NULL;
END
GO

-- =====================================================
-- 3. SET DEFAULT VALUES FOR NEW RECORDS
-- =====================================================

-- Set default for User.createdat
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[User]') AND name = 'createdat')
BEGIN
    ALTER TABLE [dbo].[User]
    ADD CONSTRAINT DF_User_createdat DEFAULT (GETUTCDATE()) FOR [createdat];
END
GO

-- Set default for conversation.created_at (if not already set)
IF NOT EXISTS (SELECT * FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'[dbo].[conversation]') AND parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[conversation]') AND name = 'created_at'))
BEGIN
    ALTER TABLE [dbo].[conversation]
    ADD CONSTRAINT DF_conversation_created_at DEFAULT (GETUTCDATE()) FOR [created_at];
END
GO

-- Set default for conversation.updated_at
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[conversation]') AND name = 'updated_at')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'[dbo].[conversation]') AND parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[conversation]') AND name = 'updated_at'))
    BEGIN
        ALTER TABLE [dbo].[conversation]
        ADD CONSTRAINT DF_conversation_updated_at DEFAULT (GETUTCDATE()) FOR [updated_at];
    END
END
GO

-- Set default for message.created_at (if not already set)
IF NOT EXISTS (SELECT * FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'[dbo].[message]') AND parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[message]') AND name = 'created_at'))
BEGIN
    ALTER TABLE [dbo].[message]
    ADD CONSTRAINT DF_message_created_at DEFAULT (GETUTCDATE()) FOR [created_at];
END
GO

-- =====================================================
-- 4. ADD FOREIGN KEY CONSTRAINTS (Optional but recommended)
-- =====================================================
-- These ensure data integrity between tables

-- Conversation -> Property foreign key
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_conversation_property')
BEGIN
    ALTER TABLE [dbo].[conversation]
    ADD CONSTRAINT FK_conversation_property
    FOREIGN KEY ([property_id]) REFERENCES [dbo].[Property]([id]);
END
GO

-- Conversation -> User (buyer) foreign key
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_conversation_buyer')
BEGIN
    ALTER TABLE [dbo].[conversation]
    ADD CONSTRAINT FK_conversation_buyer
    FOREIGN KEY ([buyer_id]) REFERENCES [dbo].[User]([id]);
END
GO

-- Conversation -> User (seller) foreign key
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_conversation_seller')
BEGIN
    ALTER TABLE [dbo].[conversation]
    ADD CONSTRAINT FK_conversation_seller
    FOREIGN KEY ([seller_id]) REFERENCES [dbo].[User]([id]);
END
GO

-- Message -> Conversation foreign key
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_message_conversation')
BEGIN
    ALTER TABLE [dbo].[message]
    ADD CONSTRAINT FK_message_conversation
    FOREIGN KEY ([conversation_id]) REFERENCES [dbo].[conversation]([id]) ON DELETE CASCADE;
END
GO

-- Message -> User (sender) foreign key
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_message_sender')
BEGIN
    ALTER TABLE [dbo].[message]
    ADD CONSTRAINT FK_message_sender
    FOREIGN KEY ([sender_id]) REFERENCES [dbo].[User]([id]);
END
GO

-- =====================================================
-- 5. ADD INDEXES FOR PERFORMANCE (Recommended)
-- =====================================================

-- Index on conversation for quick lookups by user
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_conversation_buyer_id')
BEGIN
    CREATE NONCLUSTERED INDEX IX_conversation_buyer_id
    ON [dbo].[conversation]([buyer_id]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_conversation_seller_id')
BEGIN
    CREATE NONCLUSTERED INDEX IX_conversation_seller_id
    ON [dbo].[conversation]([seller_id]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_conversation_property_id')
BEGIN
    CREATE NONCLUSTERED INDEX IX_conversation_property_id
    ON [dbo].[conversation]([property_id]);
END
GO

-- Index on message for quick lookups by conversation
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_message_conversation_id')
BEGIN
    CREATE NONCLUSTERED INDEX IX_message_conversation_id
    ON [dbo].[message]([conversation_id]);
END
GO

-- Index on message for quick lookups of unread messages
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_message_read_at')
BEGIN
    CREATE NONCLUSTERED INDEX IX_message_read_at
    ON [dbo].[message]([read_at]);
END
GO

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the updates were successful

-- Check User table columns
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'User'
  AND COLUMN_NAME IN ('createdat', 'updatedat', 'dte', 'mobile');

-- Check conversation table columns
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'conversation';

-- Check message table columns
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'message';

-- Check foreign keys
SELECT
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ColumnName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ReferencedColumn
FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fkc
    ON fk.object_id = fkc.constraint_object_id
WHERE OBJECT_NAME(fk.parent_object_id) IN ('conversation', 'message')
ORDER BY TableName, ForeignKeyName;
