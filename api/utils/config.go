package utils

import (
	"github.com/milindmadhukar/dreamteam/models"
	"github.com/spf13/viper"
)

// Load config from viper
func LoadConfig(path, name, config_type string) (config *models.Configuration, err error) {

	viper.AddConfigPath(path)
	viper.SetConfigName(name)
	viper.SetConfigType(config_type)
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	if err := viper.Unmarshal(&config); err != nil {
		return nil, err
	}

	return
}
