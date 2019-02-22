from django.test import TestCase

# Create your tests here.
class SampleTestCase(TestCase):
  def test_sample(self):
    self.assertEqual('sample'.upper(), 'SAMPLE')
