const { execSync } = require('child_process');

// to compile, use javac src/main/java/Main.java 

try {
  const javaOutput = execSync('java src.main.java.Main').toString().trim();
  console.log('Java output:', javaOutput);
} catch (error) {
  console.error('Java program execution failed:', error);
}
