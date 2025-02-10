from setuptools import setup, find_packages

setup(
    name="backend",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "django>=4.0.0",
        "gunicorn>=20.1.0",
        "whitenoise>=6.0.0",
        "djangorestframework>=3.14.0",
        "djangorestframework-simplejwt>=5.3.0",
    ],
)

