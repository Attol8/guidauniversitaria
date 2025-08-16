# University Course Data and Logo Management Pipeline
# Run `make help` to see available commands

.PHONY: help fetch-data fetch-dev list-unis check-missing download-logos validate upload clean test

# Default Python command
PYTHON := python3

# Data directories
DATA_DIR := pipelines/data
LOGOS_DIR := public/images/uni_images/uni_logos

help: ## Show this help message
	@echo "University Course Data and Logo Pipeline"
	@echo "========================================"
	@echo
	@echo "Main Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "Environment Variables:"
	@echo "  GOOGLE_API_KEY    - Google Custom Search API key (optional)"
	@echo "  GOOGLE_CX         - Google Custom Search CX ID (optional)"
	@echo
	@echo "Examples:"
	@echo "  make fetch-data          # Fetch latest production data"
	@echo "  make logos-missing       # Check which logos are missing"
	@echo "  make download-logos      # Download missing logos"
	@echo "  make validate           # Validate all logos"
	@echo "  make pipeline           # Run complete pipeline"

# === Data Fetching ===

fetch-data: ## Fetch latest course data from production API
	@echo "🌐 Fetching production course data..."
	@mkdir -p $(DATA_DIR)
	$(PYTHON) pipelines/fetch_courses_data.py \
		--env production \
		--fetch \
		--sleep 1.5

fetch-dev: ## Fetch sample data for development (2 pages only)
	@echo "🌐 Fetching development sample data..."
	@mkdir -p $(DATA_DIR)
	$(PYTHON) pipelines/fetch_courses_data.py \
		--env development \
		--fetch \
		--sleep 0.5

process-data: ## Process cached raw data without fetching
	@echo "⚙️ Processing cached course data..."
	$(PYTHON) pipelines/fetch_courses_data.py --env production

process-dev: ## Process cached development data
	@echo "⚙️ Processing cached development data..."
	$(PYTHON) pipelines/fetch_courses_data.py --env development

# === University Management ===

list-unis: ## Extract canonical university list from course data
	@echo "🏫 Extracting university list..."
	$(PYTHON) pipelines/list_universities.py

check-missing: ## Check which universities are missing logos
	@echo "🔍 Checking for missing logos..."
	$(PYTHON) pipelines/check_missing_logos.py

# === Logo Management ===

download-logos: ## Download missing logos from multiple sources
	@echo "📥 Downloading missing logos..."
	$(PYTHON) pipelines/download_university_logos.py \
		--delay 2.0 \
		--resize \
		$(if $(GOOGLE_API_KEY),--google-api-key $(GOOGLE_API_KEY)) \
		$(if $(GOOGLE_CX),--google-cx $(GOOGLE_CX))

download-logos-high: ## Download only high-priority missing logos
	@echo "📥 Downloading high-priority logos..."
	$(PYTHON) pipelines/download_university_logos.py \
		--priority high \
		--delay 1.0 \
		--resize \
		$(if $(GOOGLE_API_KEY),--google-api-key $(GOOGLE_API_KEY)) \
		$(if $(GOOGLE_CX),--google-cx $(GOOGLE_CX))

download-logos-test: ## Download 5 missing logos for testing
	@echo "📥 Testing logo download (5 logos)..."
	$(PYTHON) pipelines/download_university_logos.py \
		--limit 5 \
		--delay 1.0 \
		--resize

resize-logos: ## Resize all logos to standard size
	@echo "🖼️ Resizing logos..."
	$(PYTHON) pipelines/resize_images.py

# === Validation ===

validate: ## Validate all university logos
	@echo "✅ Validating logos..."
	$(PYTHON) pipelines/validate_logos.py

validate-sample: ## Validate a sample of logos (for testing)
	@echo "✅ Validating logo sample..."
	$(PYTHON) pipelines/validate_logos.py --sample 50

# === Upload ===

upload: ## Upload processed data to Firestore
	@echo "☁️ Uploading to Firestore..."
	$(PYTHON) pipelines/update_courses.py

upload-dev: ## Upload to development Firestore
	@echo "☁️ Uploading to development Firestore..."
	@echo "⚠️ Make sure LOCAL_ENV=true in your environment"
	$(PYTHON) pipelines/update_courses.py

# === Pipeline Workflows ===

pipeline: ## Run complete production pipeline
	@echo "🚀 Running complete production pipeline..."
	@$(MAKE) fetch-data
	@$(MAKE) list-unis
	@$(MAKE) check-missing
	@$(MAKE) download-logos-high
	@$(MAKE) validate
	@echo "✅ Pipeline complete! Run 'make upload' to deploy."

pipeline-dev: ## Run development pipeline with sample data
	@echo "🚀 Running development pipeline..."
	@$(MAKE) fetch-dev
	@$(MAKE) list-unis
	@$(MAKE) check-missing
	@$(MAKE) validate-sample
	@echo "✅ Development pipeline complete!"

logo-pipeline: ## Run logo-only pipeline (assumes data exists)
	@echo "🖼️ Running logo pipeline..."
	@$(MAKE) list-unis
	@$(MAKE) check-missing
	@$(MAKE) download-logos
	@$(MAKE) resize-logos
	@$(MAKE) validate
	@echo "✅ Logo pipeline complete!"

# === Testing ===

test: ## Run all pipeline tests
	@echo "🧪 Running pipeline tests..."
	@$(MAKE) fetch-dev
	@$(MAKE) list-unis
	@$(MAKE) check-missing
	@$(MAKE) download-logos-test
	@$(MAKE) validate-sample
	@echo "✅ All tests passed!"

# === Maintenance ===

clean: ## Clean up generated files
	@echo "🧹 Cleaning up..."
	rm -f $(DATA_DIR)/raw_*.json
	rm -f $(DATA_DIR)/test_*.json
	rm -f $(DATA_DIR)/universities.csv
	rm -f $(DATA_DIR)/missing_logos.json
	rm -f $(DATA_DIR)/validation_report.json
	rm -f pipelines/logs/*.log

clean-logos: ## Remove all downloaded logos (keeps aliases.json)
	@echo "🧹 Cleaning logos..."
	@read -p "This will delete all logo files except aliases.json. Continue? [y/N] " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		find $(LOGOS_DIR) -name "*.png" -not -name "aliases.json" -delete; \
		find $(LOGOS_DIR) -name "*.jpg" -not -name "aliases.json" -delete; \
		find $(LOGOS_DIR) -name "*.svg" -not -name "aliases.json" -delete; \
		echo "Logos cleaned."; \
	else \
		echo "Cancelled."; \
	fi

status: ## Show pipeline status
	@echo "📊 Pipeline Status"
	@echo "=================="
	@echo -n "Raw data (prod): "; [ -f $(DATA_DIR)/raw_all_courses_data.json ] && echo "✅ Present" || echo "❌ Missing"
	@echo -n "Processed data (prod): "; [ -f $(DATA_DIR)/all_courses_data.json ] && echo "✅ Present" || echo "❌ Missing"
	@echo -n "Universities list: "; [ -f $(DATA_DIR)/universities.csv ] && echo "✅ Present" || echo "❌ Missing"
	@echo -n "Missing logos check: "; [ -f $(DATA_DIR)/missing_logos.json ] && echo "✅ Present" || echo "❌ Missing"
	@echo -n "Validation report: "; [ -f $(DATA_DIR)/validation_report.json ] && echo "✅ Present" || echo "❌ Missing"
	@echo
	@echo -n "Logo files count: "; find $(LOGOS_DIR) -name "*.png" -o -name "*.jpg" -o -name "*.svg" | wc -l | xargs echo
	@echo -n "Aliases file: "; [ -f $(LOGOS_DIR)/aliases.json ] && echo "✅ Present" || echo "❌ Missing"

# === Requirements ===

requirements: ## Install Python requirements
	@echo "📦 Installing Python requirements..."
	pip install -r requirements.txt

requirements-dev: ## Install development requirements
	@echo "📦 Installing development requirements..."
	pip install -r requirements-dev.txt

# Create requirements.txt if it doesn't exist
requirements.txt:
	@echo "📝 Creating requirements.txt..."
	@echo "requests>=2.28.0" > requirements.txt
	@echo "tqdm>=4.64.0" >> requirements.txt
	@echo "Pillow>=9.0.0" >> requirements.txt
	@echo "unidecode>=1.3.0" >> requirements.txt
	@echo "openai>=1.0.0" >> requirements.txt
	@echo "google-api-python-client>=2.0.0" >> requirements.txt
	@echo "firebase-admin>=6.0.0" >> requirements.txt

# Environment setup
setup: requirements.txt requirements ## Initial setup
	@echo "🔧 Setting up pipeline environment..."
	@mkdir -p $(DATA_DIR)
	@mkdir -p $(LOGOS_DIR)
	@mkdir -p pipelines/logs
	@echo "✅ Environment setup complete!"