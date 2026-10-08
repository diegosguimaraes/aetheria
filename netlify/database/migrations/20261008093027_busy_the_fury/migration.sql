CREATE TABLE "game_saves" (
	"owner_hash" text,
	"slot_key" text,
	"state" jsonb NOT NULL,
	"metadata" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_saves_pkey" PRIMARY KEY("owner_hash","slot_key")
);
