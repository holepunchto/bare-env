cmake_minimum_required(VERSION 3.25)

project(bare_env C)

include(bare)

add_bare_module(bare_env)

target_sources(
  bare_env
  PRIVATE
    binding.c
)
