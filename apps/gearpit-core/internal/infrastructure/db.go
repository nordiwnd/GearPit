// apps/gearpit-core/internal/infrastructure/db.go
package infrastructure

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func NewDBConnection() (*gorm.DB, error) {
	// 環境変数から接続情報を取得（K8sのSecret/ConfigMapから注入される前提）
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Tokyo",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	// 本番/開発でログレベルを変えるなどの調整はここで行う
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Connection Pool設定
	sqlDB, _ := db.DB()
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}

func RunMigrations(db *gorm.DB) {
	log.Println("Running Database Migrations...")
	// ここにモデルを追加していく
	err := db.AutoMigrate(&model.Item{})
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Database Migration Completed.")
}
