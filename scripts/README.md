# Scripts Structure

Automation and utility scripts are organized by domain:

- `scripts/audio/`: audio generation, repair, and preview helpers.
- `scripts/books/`: book ingestion and verification maintenance.
- `scripts/testing/`: manual API/upload verification scripts.
- `scripts/data-migration/`: one-off migration and data correction scripts.
- `scripts/shell/`: shell-based batch workflows.

## Usage notes

- Run TypeScript files with `npx tsx <script-path>`.
- Run JavaScript files with `node <script-path>`.
- Keep production code out of this folder; this directory is for operational tooling only.
