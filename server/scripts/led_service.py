from flask import Flask, request, jsonify
import RPi.GPIO as GPIO
from threading import Lock
import atexit

app = Flask(__name__)

RED, GREEN, BLUE = 17, 27, 22
PWM_FREQ = 500

GPIO.setmode(GPIO.BCM)
GPIO.setup([RED, GREEN, BLUE], GPIO.OUT)

pwm_r = GPIO.PWM(RED, PWM_FREQ)
pwm_g = GPIO.PWM(GREEN, PWM_FREQ)
pwm_b = GPIO.PWM(BLUE, PWM_FREQ)

# common anode → 100 = off
pwm_r.start(100)
pwm_g.start(100)
pwm_b.start(100)

lock = Lock()
LED_ENABLED = True
NIGHT_MODE = False

def set_rgb(r, g, b):
    with lock:
        if not LED_ENABLED:
            pwm_r.ChangeDutyCycle(100)
            pwm_g.ChangeDutyCycle(100)
            pwm_b.ChangeDutyCycle(100)
            return

        if NIGHT_MODE:
            r, g, b = r // 3, g // 3, b // 3

        pwm_r.ChangeDutyCycle(100 - (r / 255 * 100))
        pwm_g.ChangeDutyCycle(100 - (g / 255 * 100))
        pwm_b.ChangeDutyCycle(100 - (b / 255 * 100))

@app.post("/led")
def led():
    global LED_ENABLED
    data = request.json
    LED_ENABLED = data.get("enabled", True)
    color = data.get("color", [255, 255, 255])
    set_rgb(*color)
    return jsonify(ok=True)

@app.post("/night")
def night():
    global NIGHT_MODE
    NIGHT_MODE = request.json.get("night", False)
    return jsonify(ok=True)

@atexit.register
def cleanup():
    pwm_r.stop()
    pwm_g.stop()
    pwm_b.stop()
    GPIO.cleanup()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000)