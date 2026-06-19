module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const minimizer = webpackConfig.optimization.minimizer;
      if (minimizer) {
        webpackConfig.optimization.minimizer = minimizer.filter(
          (plugin) => plugin.constructor.name !== "CssMinimizerPlugin"
        );
      }
      return webpackConfig;
    },
  },
};
