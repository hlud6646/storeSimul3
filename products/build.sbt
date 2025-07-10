val scala3Version = "3.7.1"

lazy val root = project
  .in(file("."))
  .settings(
    name := "products",
    version := "0.1.0-SNAPSHOT",
    scalaVersion := scala3Version,
    libraryDependencies ++= List(
      "com.github.javafaker" % "javafaker" % "1.0.2",
      "org.postgresql" % "postgresql" % "42.2.24"
    ),
    watchTriggeredMessage := Watch.clearScreenOnTrigger,
    fork := true
  )
