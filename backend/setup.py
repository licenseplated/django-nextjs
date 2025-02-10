from setuptools import setup, find_packages

setup(
    name="backend",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "django>=4.0.0",
        "gunicorn>=20.1.0",
        "whitenoise>=6.0.0",
    ],
)

